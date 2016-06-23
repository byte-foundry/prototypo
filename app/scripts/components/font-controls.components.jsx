import React from 'react';
import Lifespan from 'lifespan';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import {BatchUpdate} from '../helpers/undo-stack.helpers.js';

import {ControlsTabs, ControlsTab} from './controls-tabs.components.jsx';
import {FontValues} from '../services/values.services.js';
import {Sliders} from './sliders.components.jsx';

export default class FontControls extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			tabControls: 'Func',
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	async componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
		const server = new LocalServer().instance;

		const prototypoStore = await this.client.fetch('/prototypoStore');
		this.setState({
			typeface: prototypoStore.get('variant') || {},
		})

		const debouncedSave = _.debounce((values) => {
			FontValues.save({
				typeface: this.state.typeface.db || 'default',
				values,
			});
		}, 300);

		/*this.undoWatcher = new BatchUpdate(prototypoStore,
			'/prototypoStore',
			this.client,
			this.lifespan,
			(name) => {
				return `modifier ${name}`;
			},
			(headJS) => {
				debouncedSave(headJS.controlsValues);
			}
			);*/

		server.on('action', ({path, params}) => {
			if (path === '/change-param') {
				const newParams = {};

				Object.assign(newParams, prototypoStore.get('controlsValues'));

				if (this.state.indivMode && this.state.indivEdit && !params.values) {
					if (newParams.indiv_group_param[this.state.currentGroup][params.name]) {
						newParams.indiv_group_param[this.state.currentGroup][params.name].value = params.value;
					}
					else {
						newParams.indiv_group_param[this.state.currentGroup][params.name] = {
							state: 'relative',
							value: params.value,
						};
					}
				}
				else if (params.values) {
					_.assign(newParams, params.values);
				}
				else {
						newParams[params.name] = params.value;
				}


				const patch = prototypoStore.set('controlsValues', newParams).commit();

				server.dispatchUpdate('/prototypoStore', patch);

				debouncedSave(newParams);
				/*if (params.force) {

					//TODO(franz): This SHOULD totally end up being in a flux store on hoodie
					this.undoWatcher.forceUpdate(patch, params.label);
				}
				else {

					this.undoWatcher.update(patch, params.label);

					}*/

			}
			else if (path === '/change-param-state') {
				const newParams = {};

				Object.assign(newParams, prototypoStore.get('controlValues'));

				newParams.indiv_group_param[this.state.currentGroup][params.name] = {
					state: params.state,
					value: params.state === 'relative' ? 1 : 0,
				};

				const patch = prototypoStore.set('controlsValues', newParams).commit();

				server.dispatchUpdate('/prototypoStore', patch);
				debouncedSave(newParams);

				/*if (params.force) {

					//TODO(franz): This SHOULD totally end up being in a flux store on hoodie
					this.undoWatcher.forceUpdate(patch, params.label);
				}
				else {

					this.undoWatcher.update(patch, params.label);

					}*/
			}}, this.lifespan);

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				const headJS = head.toJS();

				if (this.state.values !== headJS.controlsValues) {
					this.client.dispatchAction('/update-font', headJS.controlsValues);
				}

				this.setState({
					tabControls: headJS.fontTab,
					values: headJS.controlsValues,
					parameters: headJS.fontParameters,
					typeface: headJS.variant,
					indivMode: headJS.indivMode,
					indivEdit: headJS.indivEdit,
					currentGroup: headJS.indivCurrentGroup,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		const parameters = prototypoStore.get('fontParameters');
		//TODO(franz): setup a getInitialState
		const values = prototypoStore.get('controlsValues');

		this.setState({
			parameters,
			values,
		});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] font controls');
		}

		const tabs = _.map(this.state.parameters, (group) => {
			return (
				<ControlsTab iconId={group.label} name={group.label} key={group.label}>
					<Sliders
						params={group.parameters}
						values={this.state.values}
						indivMode={this.state.indivMode}
						indivEdit={this.state.indivEdit}
						currentGroup={this.state.currentGroup}/>
				</ControlsTab>
			);
		});

		tabs.unshift(<ControlsTab iconId="func" name="settings" key="settings"></ControlsTab>);

		return (
			<div className="font-controls" id="sidebar">
				<ControlsTabs tab={this.state.tabControls} >
					{tabs}
				</ControlsTabs>
			</div>
		);
	}
}
