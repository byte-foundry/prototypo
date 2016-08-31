import React from 'react';
import Lifespan from 'lifespan';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import LocalClient from '../stores/local-client.stores.jsx';

import {ControlsTabs, ControlsTab} from './controls-tabs.components.jsx';
import {Sliders} from './sliders.components.jsx';

export default class FontControls extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			tabControls: 'Func',
			currentGroup: {},
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	async componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();

		const prototypoStore = await this.client.fetch('/prototypoStore');
		const undoableStore = await this.client.fetch('/undoableStore');

		this.setState({
			typeface: prototypoStore.get('variant') || {},
		});


		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				const headJS = head.toJS();

				this.setState({
					tabControls: headJS.fontTab,
					credits: headJS.credits,
					parameters: headJS.fontParameters,
					typeface: headJS.variant,
					indivMode: headJS.indivMode,
					indivEdit: headJS.indivEditingParams,
					currentGroup: headJS.indivCurrentGroup || {},
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client.getStore('/undoableStore', this.lifespan)
			.onUpdate(({head}) => {
				const headJS = head.toJS();

				this.setState({
					values: headJS.controlsValues,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		const parameters = prototypoStore.get('fontParameters');
		//TODO(franz): setup a getInitialState
		const values = undoableStore.get('controlsValues');

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
						credits={this.state.credits}
						indivMode={this.state.indivMode}
						indivEdit={this.state.indivEdit}
						currentGroup={this.state.currentGroup.name}/>
				</ControlsTab>
			);
		});

		return (
			<div className="font-controls" id="sidebar">
				<ControlsTabs tab={this.state.tabControls} >
					{tabs}
				</ControlsTabs>
			</div>
		);
	}
}
