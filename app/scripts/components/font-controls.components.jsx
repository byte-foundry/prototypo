import React from 'react';
import {ControlsTabs,ControlsTab} from './controls-tabs.components.jsx';
import Remutable from 'remutable';
import {Sliders} from './sliders.components.jsx';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import {BatchUpdate} from '../helpers/undo-stack.helpers.js';
import {Typefaces} from '../services/typefaces.services.js';

export default class FontControls extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			tabControls: 'Func',
		};
	}

	async componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = new LocalClient().instance;
		const server = new LocalServer().instance;

		const fontControls = await this.client.fetch('/fontControls');
		const fontTab = await this.client.fetch('/fontTab');

		this.undoWatcher = new BatchUpdate(fontControls, '/fontControls', this.client, this.lifespan, Infinity);

		server.on('action', ({path, params}) => {
			if (path == '/change-tab-font') {

				const patch = fontTab.set('tab',params.name).commit();
				server.dispatchUpdate('/fontTab', patch);

			}
			else if (path == '/change-param') {
				let newParams = {};
				Object.assign(newParams, fontControls.get('values'));
				newParams[params.name] = params.value;
				const patch = fontControls.set('values',newParams).commit();
				server.dispatchUpdate('/fontControls',patch);
				if (params.force) {
					this.undoWatcher.forceUpdate(patch);
				} else {
					this.undoWatcher.update(patch, params.name);
				}
			}
			else if (path == '/load-params') {
				const patch = fontControls.set('values',params).commit();
				server.dispatchUpdate('/fontControls',patch);
				this.client.dispatchAction('/store-action',{store:'/fontControls',patch});
			}
		}, this.lifespan);


		const parameters = await Typefaces.get();

		this.setState({
			parameters,
		});

		this.client.dispatchAction('/load-params',parameters.presets.Blackletter);

		this.client.getStore('/fontTab', this.lifespan)
			.onUpdate(({head}) => {
				const headJS = head.toJS();
				this.setState({
					tabControls:headJS.tab,
				});
			})
			.onDelete(() => this.setState(undefined)).value;

		this.client.getStore('/fontControls', this.lifespan)
			.onUpdate(({head}) => {
				const headJS = head.toJS();
				this.setState({
					values:headJS.values,
				});
			})
			.onDelete(() => this.setState(undefined)).value;

		this.client.dispatchAction('/change-tab-font',{name: 'Func'});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		const tabs = this.state.parameters ? _.map(this.state.parameters.parameters,(group) => {
			return (
				<ControlsTab iconId={group.label} name={group.label} key={group.label}>
					<Sliders params={group.parameters} values={this.state.values}/>
				</ControlsTab>
			);
		}) : undefined;

		return (
			<div className="font-controls">
				<ControlsTabs tab={this.state.tabControls} >
					{tabs}
				</ControlsTabs>
			</div>
		)
	}
}
