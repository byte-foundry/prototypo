import React from 'react';
import Classnames from 'classnames';
import Lifespan from 'lifespan';

import LocalClient from '../stores/local-client.stores.jsx';
import HoodieApi from '../services/hoodie.services.js';
import DOM from '../helpers/dom.helpers.js';

export class Sliders extends React.Component {

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] sliders');
		}
		const sliders = _.map(this.props.params, (param, i) => {
			const individualized = this.props.indivEdit;
			let value;
			const paramToUse = {};

			if (this.props.indivMode
				&& this.props.indivEdit
				&& this.props.values.indiv_group_param[this.props.currentGroup]) {
				const paramObject = this.props.values.indiv_group_param[this.props.currentGroup][`${param.name}_rel`] || {state: 'relative', value: 1};

				value = paramObject.value;
					_.assign(paramToUse, param, {
						state: paramObject.state,
						name: `${param.name}_rel`,
						max: paramObject.state === 'relative' ? 1.5 : (param.max - param.min) / 2,
						min: paramObject.state === 'relative' ? 0.5 : -(param.max - param.min) / 2,
						maxAdvised: paramObject.state === 'relative' ? 1.25 : (param.max - param.min) / 4,
						minAdvised: paramObject.state === 'relative' ? 0.25 : -(param.max - param.min) / 4,
						init: paramObject.state === 'relative' ? 1 : 0,
					});
			}
			else {
				_.assign(paramToUse, param);
				value = this.props.values ? this.props.values[param.name] : undefined;
			}

			return (
				<Slider
					param={paramToUse}
					key={paramToUse.name + i}
					value={value}
					individualized={individualized}/>
			);
		});

		return (
			<div className="sliders">
				{sliders}
			</div>
		);
	}
}

export class Slider extends React.Component {

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	resetValue() {
		this.client.dispatchAction('/change-param', {value: this.props.param.init, name: this.props.param.name, label: this.props.param.label, force: true});
	}

	shouldComponentUpdate(nextProps) {
		if (nextProps.value && this.props.value) {
			return nextProps.value !== this.props.value
				|| nextProps.max !== this.props.max
				|| nextProps.individualized !== this.props.individualized;
		}
		return true;
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] slider');
		}
		const value = this.props.value === undefined ? this.props.param.init : this.props.value;
		const plan = HoodieApi.instance.plan || 'kickstarter';

		this.props.param.notInDemo = (plan.indexOf('free') === 0 && !this.props.param.demo);

		const classes = Classnames({
			'slider': true,
			'is-disabled': this.props.param.disabled || this.props.param.notInDemo,
			'is-coming': this.props.param.disabled,
			'is-child': this.props.param.child,
		});

		const demoOverlay = this.props.param.notInDemo && !this.props.param.disabled ? (
			<a href="https://www.prototypo.io/account#/account" className="slider-demo-overlay-text">
				This feature is available with the professional subscription
				<div className="slider-demo-overlay-text-more">
					<div className="slider-demo-overlay-text-more-text">Uppgrade to full version</div>
				</div>
			</a>
		) : this.props.param.disabled ? (
			<div className="slider-demo-overlay-text">
				This feature is currently in development
			</div>
		) : false;

		const indivSwitch = this.props.individualized ? (
			<IndivSwitch name={this.props.param.name} state={this.props.param.state}/>
		) : false;

		return (
			<div className={classes}>
				<div className="slider-demo-overlay">
					{demoOverlay}
				</div>
				<label className="slider-title">{this.props.param.label}</label>
				<div className="slider-reset" onClick={() => {this.resetValue();}}>reset</div>
				<SliderTextController value={value} name={this.props.param.name} label={this.props.param.label} disabled={this.props.param.disabled} individualized={this.props.individualized}/>
				<div className="slider-container">
					<SliderController value={value}
						name={this.props.param.name}
						individualized={this.props.individualized}
						label={this.props.param.label}
						min={this.props.param.min}
						max={this.props.param.max}
						minAdvised={this.props.param.minAdvised}
						maxAdvised={this.props.param.maxAdvised}
						disabled={this.props.param.disabled}
						child={this.props.param.child}/>
					{indivSwitch}
				</div>
			</div>
		);
	}
}

export class SliderController extends React.Component {

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();

		document.addEventListener('mouseup',
			this.handleUp.bind(this));
		window.addEventListener('mousemove',
			this.handleMove.bind(this));
		document.addEventListener('selectstart',
			this.handleSelectstart.bind(this));
	}

	componentDidMount() {
		const slider = React.findDOMNode(this.refs.slider);

		this.sliderWidth = slider.offsetWidth;
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	handleDown(e) {
		if (this.props.disabled) {
			return;
		}

		this.tracking = true;
		const newX = e.pageX || e.screenX;
		const {offsetLeft} = DOM.getAbsOffset(React.findDOMNode(this.refs.slider));
		let newValue = ((newX - offsetLeft) / this.sliderWidth * (this.props.max - this.props.min)) + this.props.min;

		newValue = Math.min(Math.max(newValue, this.props.min), this.props.max);

		this.client.dispatchAction('/change-param', {value: newValue, name: this.props.name, label: this.props.label, force: true});
		this.currentX = newX;

		e.stopPropagation();
	}

	handleUp(e) {
		if (!this.tracking) {
			return;
		}

		this.tracking = false;
		this.client.dispatchAction('/change-param', {value: this.props.value, name: this.props.name, label: this.props.label, force: true});

		e.stopPropagation();
	}

	handleMove(e) {
		if (!this.tracking) {
			return;
		}

		const newX = e.pageX || e.screenX;
		const el = React.findDOMNode(this.refs.slider);
		const {offsetLeft} = DOM.getAbsOffset(el);
		let newValue;

		if (newX >= offsetLeft && newX <= offsetLeft + el.clientWidth) {
			const variation = (newX - this.currentX) / this.sliderWidth * (this.props.max - this.props.min);

			newValue = this.props.value + variation;

			newValue = Math.min(Math.max(newValue, this.props.min), this.props.max);
		}
		else {
			newValue = newX < offsetLeft ? this.props.min : this.props.max;
		}

		this.client.dispatchAction('/change-param', {value: newValue, name: this.props.name});
		this.currentX = newX;
	}

	// This prevents preview text to be selected whil using the sliders
	handleSelectstart(e) {
		if (this.tracking) {
			return e.preventDefault();
		}
	}

	handleClick() {

	}

	render() {
		const translateX = (this.props.max - Math.min(Math.max(this.props.value, this.props.min), this.props.max)) / (this.props.max - this.props.min) * 92.0;
		const transform = {
			transform: `translateX(-${translateX}%)`,
		};

		const classes = Classnames({
			'slider-controller-bg': true,
			'is-not-advised': this.props.value < this.props.minAdvised || this.props.value > this.props.maxAdvised,
			'is-indiv': this.props.individualized,
		});

		return (
			<div className="slider-controller" ref="slider"
				onMouseDown={(e) => { this.handleDown(e);}}>
				<div className={classes} style={transform}>
					<div
						className="slider-controller-handle"
						ref="handle" ></div>
				</div>
			</div>
		);
	}
}

export class SliderTextController extends React.Component {

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		const classes = Classnames({
			'slider-text-controller': true,
			'is-indiv': this.props.individualized,
		});

		return (
			<input
				className={classes}
				type="number"
				value={this.props.value}
				onChange={(e) => {
					this.client.dispatchAction(
						'/change-param',
						{
							name: this.props.name,
							value: parseFloat(e.target.value),
							label: this.props.label,
							force: true,
						});
				}}
				disabled={this.props.disabled}
			/>
		);
	}
}

class IndivSwitch extends React.Component {
	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	changeState(state) {
		this.client.dispatchAction(
			'/change-param-state',
			{
				name: this.props.name,
				state,
				label: this.props.label,
				force: true,
			}
		);
	}

	render() {

		const indivRelative = Classnames({
			'indiv-switch-btn': true,
			'indiv-switch-relative': true,
			'is-active': this.props.state === 'relative',
		});

		const indivDelta = Classnames({
			'indiv-switch-btn': true,
			'indiv-switch-delta': true,
			'is-active': this.props.state === 'delta',
		});

		return (
			<div className="indiv-switch">
				<div className={indivRelative} onClick={() => {this.changeState('relative');}}>
					%
				</div>
				<div className={indivDelta} onClick={() => {this.changeState('delta');}}>
					px
				</div>
			</div>
		);
	}
}
