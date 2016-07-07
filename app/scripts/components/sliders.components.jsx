import React from 'react';
import Classnames from 'classnames';
import Lifespan from 'lifespan';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import LocalClient from '../stores/local-client.stores.jsx';
import DOM from '../helpers/dom.helpers.js';

export class Sliders extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}


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

			const isRadio = paramToUse.controlType === 'radio';

			return isRadio
				? (
					<RadioSlider
						demo={paramToUse.demo}
						disabled={paramToUse.disabled}
						init={paramToUse.init}
						label={paramToUse.label}
						max={paramToUse.max}
						maxAdvised={paramToUse.maxAdvised}
						min={paramToUse.min}
						minAdvised={paramToUse.minAdvised}
						name={paramToUse.name}
						notInDemo={paramToUse.notInDemo}
						child={paramToUse.child}
						key={paramToUse.name + i}
						value={value}
						state={paramToUse.state}
						individualized={individualized}
						controlType={paramToUse.controlType}
						radioValues={paramToUse.radioValues}/>
				)
				: (
					<Slider
						demo={paramToUse.demo}
						disabled={paramToUse.disabled}
						init={paramToUse.init}
						label={paramToUse.label}
						max={paramToUse.max}
						maxAdvised={paramToUse.maxAdvised}
						min={paramToUse.min}
						minAdvised={paramToUse.minAdvised}
						name={paramToUse.name}
						notInDemo={paramToUse.notInDemo}
						child={paramToUse.child}
						key={paramToUse.name + i}
						value={value}
						state={paramToUse.state}
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
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	resetValue() {
		this.client.dispatchAction('/change-param', {value: this.props.init, name: this.props.name, label: this.props.label});
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] slider');
		}
		const value = this.props.value === undefined ? this.props.init : this.props.value;

		const classes = Classnames({
			'slider': true,
			'is-coming': this.props.disabled,
			'is-child': this.props.child,
		});

		const demoOverlay = this.props.disabled
			? (
				<div className="slider-demo-overlay-text">
					This feature is currently in development
				</div>
			)
			: false;

		const indivSwitch = this.props.individualized
			? (
				<IndivSwitch name={this.props.name} state={this.props.state}/>
			)
			: false;

		return (
			<div className={classes}>
				<div className="slider-demo-overlay">
					{demoOverlay}
				</div>
				<label className="slider-title">{this.props.label}</label>
				<div className="slider-reset" onClick={() => {this.resetValue();}}>reset</div>
				<SliderTextController value={value} name={this.props.name} label={this.props.label} disabled={this.props.disabled} individualized={this.props.individualized}/>
				<div className="slider-container">
					<SliderController value={value}
						name={this.props.name}
						individualized={this.props.individualized}
						label={this.props.label}
						min={this.props.min}
						max={this.props.max}
						minAdvised={this.props.minAdvised}
						maxAdvised={this.props.maxAdvised}
						disabled={this.props.disabled}
						child={this.props.child}/>
					{indivSwitch}
				</div>
			</div>
		);
	}
}

export class RadioSlider extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] slider');
		}
		const value = this.props.value === undefined ? this.props.init : this.props.value;

		const classes = Classnames({
			'slider': true,
			'is-coming': this.props.disabled,
			'is-child': this.props.child,
		});

		const demoOverlay = this.props.disabled
			? (
				<div className="slider-demo-overlay-text">
					This feature is currently in development
				</div>
			)
			: false;

		const indivSwitch = this.props.individualized
			? (
				<IndivSwitch name={this.props.name} state={this.props.state}/>
			)
			: false;

		return (
			<div className={classes}>
				<div className="slider-demo-overlay">
					{demoOverlay}
				</div>
				<label className="slider-title">{this.props.label}</label>
				<output
					className="slider-text-controller"
					name={this.props.name}
					label={this.props.label}
					disabled={this.props.disabled}
					individualized={this.props.individualized}>
					{value}
				</output>
				<div className="slider-container">
					<SliderRadioController
						value={value}
						name={this.props.name}
						individualized={this.props.individualized}
						label={this.props.label}
						disabled={this.props.disabled}
						child={this.props.child}
						radioValues={this.props.radioValues}/>
					{indivSwitch}
				</div>
			</div>
		);
	}
}

export class SliderController extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

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
		const slider = this.refs.slider;

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
		const {offsetLeft} = DOM.getAbsOffset(this.refs.slider);
		let newValue = ((newX - offsetLeft) / this.sliderWidth * (this.props.max - this.props.min)) + this.props.min;

		newValue = Math.min(Math.max(newValue, this.props.min), this.props.max);

		this.client.dispatchAction('/change-param', {value: newValue, name: this.props.name, label: this.props.label});
		this.currentX = newX;

		e.stopPropagation();
	}

	handleUp(e) {
		if (!this.tracking) {
			return;
		}

		this.tracking = false;
		this.client.dispatchAction('/change-param', {value: this.props.value, name: this.props.name, label: this.props.label});

		e.stopPropagation();
	}

	handleMove(e) {
		if (!this.tracking) {
			return;
		}

		const newX = e.pageX || e.screenX;
		const el = this.refs.slider;
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

export class SliderRadioController extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

		//function binding to avoid unnecessery re-render
		this.handleChange = this.handleChange.bind(this);
	}

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();

	}

	componentDidMount() {
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	handleChange(e) {
		if (e.target) {
			if (e.target.value !== undefined) {
				this.client.dispatchAction('/change-param', {
					value: e.target.value,
					name: this.props.name,
					label: this.props.label,
				});
			}
		}
	}

	render() {
		const boxes = this.props.radioValues.map((item) => {
			return item.value;
		});

		const checkBoxes = boxes.map((boxValue, index) => {
			return (
				<div key={index}>
					<label>
						{boxValue}
						<input onChange={this.handleChange} value={boxValue} type="radio" name={`radio-button-${String(this.props.name).trim()}`} />
					</label>
				</div>
			);
		});

		/*
		const classes = Classnames({
			'slider-controller-bg': true,
			'is-not-advised': this.props.value < this.props.minAdvised || this.props.value > this.props.maxAdvised,
			'is-indiv': this.props.individualized,
		});
		*/

		return (
			<div onClick={this.handleClick}>
				{checkBoxes}
			</div>
		);
	}
}

export class SliderTextController extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

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
						});
				}}
				disabled={this.props.disabled}
			/>
		);
	}
}

class IndivSwitch extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

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
