import React from 'react';
import Lifespan from 'lifespan';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import LocalClient from '../stores/local-client.stores.jsx';

import {ControlsTabs, ControlsTab} from './controls-tabs.components.jsx';
import {Sliders} from './sliders.components.jsx';
import SliderTooltip from './slider-tooltip.jsx';

const voidCurrentGroup = {};

export default class FontControls extends React.PureComponent {

	constructor(props) {
		super(props);
		this.state = {
			tabControls: 'Func',
			currentGroup: {},
		};
	}

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				const headJS = head.toJS().d;

				this.setState({
					tabControls: headJS.fontTab,
					credits: headJS.credits,
					parameters: headJS.fontParameters,
					typeface: headJS.variant,
					indivMode: headJS.indivMode,
					indivEdit: headJS.indivEditingParams,
					currentGroup: headJS.indivCurrentGroup || voidCurrentGroup,
					uiSliderTooltip: head.toJS().d.uiSliderTooltip,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] font controls');
		}

		const hasSliderTooltip = this.state.uiSliderTooltip && this.state.uiSliderTooltip.display;
		let sliderTooltip;
		const transitionTimeout = 300;

		if (hasSliderTooltip) {
			sliderTooltip = (
					<SliderTooltip key={'slider-tooltip'}
						sliderName={this.state.uiSliderTooltip.sliderName}
					/>
			);
		}

		const tabs = _.map(this.state.parameters, (group) => {
			return (
				<ControlsTab iconId={group.label} name={group.label} key={group.label}>
					<Sliders
						params={group.parameters}
						credits={this.state.credits}
						indivMode={this.state.indivMode}
						indivEdit={this.state.indivEdit}
						currentGroup={this.state.currentGroup.name}/>
				</ControlsTab>
			);
		});

		return (
			<div className="font-controls" id="sidebar">
				<ReactCSSTransitionGroup
					component="div"
					transitionName="slider-tooltip-animation"
					transitionEnterTimeout={transitionTimeout}
					transitionLeaveTimeout={transitionTimeout}>
					{sliderTooltip}
				</ReactCSSTransitionGroup>
				<ControlsTabs tab={this.state.tabControls} >
					{tabs}
				</ControlsTabs>
			</div>
		);
	}
}
