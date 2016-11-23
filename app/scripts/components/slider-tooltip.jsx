import React from 'react';

import Lifespan from 'lifespan';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import LocalClient from '../stores/local-client.stores.jsx';

import CloseButton from './close-button.components.jsx';
import HelpText from '../../images/sliders/helpText.json';

export default class SliderTooltip extends React.Component {
  constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.closeTooltip = this.closeTooltip.bind(this);
    this.getNextTooltip = this.getNextTooltip.bind(this);
    this.getPreviousTooltip = this.getPreviousTooltip.bind(this);
	}

  componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
	}

  componentWillUnmount() {
		this.lifespan.release();
	}

  closeTooltip(e) {
    e.preventDefault();
    this.client.dispatchAction('/store-value', {uiSliderTooltip: {display: false}});
  }

  getPreviousTooltip() {
    let previousSliderName;
    const HelpTextKeys = Object.keys(HelpText);

    previousSliderName = HelpTextKeys[HelpTextKeys.indexOf(this.props.sliderName) - 1];
    if (!previousSliderName) {
      previousSliderName = HelpTextKeys[HelpTextKeys.length - 1];
    }
    this.client.dispatchAction('/store-value', {uiSliderTooltip: {display: true, sliderName: previousSliderName}});
  }

  getNextTooltip() {
    let nextSliderName;
    const HelpTextKeys = Object.keys(HelpText);

    nextSliderName = HelpTextKeys[HelpTextKeys.indexOf(this.props.sliderName) + 1];
    if (!nextSliderName) {
      nextSliderName = HelpTextKeys[0];
    }
    this.client.dispatchAction('/store-value', {uiSliderTooltip: {display: true, sliderName: nextSliderName}});
  }

	render() {
    if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] slider tooltip');
		}

    const sliderUrl = `/assets/images/sliders/${this.props.sliderName}.gif`;

		return (
      <div id="prototyposlidertooltip" key="sliderTooltipContainer">
        <img src={sliderUrl}/>
        <p className="slider-tooltip-title">{HelpText[this.props.sliderName].title}</p>
        <p className="slider-tooltip-description">{HelpText[this.props.sliderName].description}</p>
        <span onClick={() => {this.getPreviousTooltip(); }}>{'<'}</span><span onClick={() => {this.getNextTooltip(); }}>{'>'}</span>
        <CloseButton click={this.closeTooltip}/>
      </div>
		);
	}
}
