import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import Lifespan from 'lifespan';

import LocalClient from '../stores/local-client.stores.jsx';
import {indivGroupsEditionTutorialLabel} from '../helpers/joyride.helpers.js';
import SliderHelpText from '../../images/sliders/helpText.json';

import SliderController from './slider-controller.components';

export class Sliders extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {};
	}

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();

		this.client
			.getStore('/undoableStore', this.lifespan)
			.onUpdate((head) => {
				const headJS = head.toJS().d;

				this.setState({
					values: headJS.controlsValues,
				});
			})
			.onDelete(() => {
				this.setState({values: undefined});
			});

		this.client
			.getStore('/userStore', this.lifespan)
			.onUpdate((head) => {
				const {subscription} = head.toJS().d;

				this.setState({
					subscription,
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
		if (!this.state.values) {
			return false;
		}

		const {advancedMode} = this.props;

		const sliders = this.props.params.map((param, i) => {
			const individualized = this.props.indivEdit;
			let value;
			let paramToUse = {};
			if (!this.props.advancedMode && param.advanced) {
				return false;
			};
			if (
				this.props.indivMode
				&& this.props.indivEdit
				&& this.state.values.indiv_group_param[this.props.currentGroup]
			) {
				const paramObject = this.state.values.indiv_group_param[
					this.props.currentGroup
				][`${param.name}_rel`] || {state: 'relative', value: 1};

				value = paramObject.value;
				paramToUse = {
					...paramToUse,
					...param,
					state: paramObject.state,
					name: `${param.name}_rel`,
					max:
						paramObject.state === 'relative'
							? 1.5
							: (param.max - param.min) / 2,
					min:
						paramObject.state === 'relative'
							? 0.5
							: -(param.max - param.min) / 2,
					maxAdvised:
						paramObject.state === 'relative'
							? 1.25
							: (param.max - param.min) / 4,
					minAdvised:
						paramObject.state === 'relative'
							? 0.25
							: -(param.max - param.min) / 4,
					init: paramObject.state === 'relative' ? 1 : 0,
				};
			}
			else {
				paramToUse = {
					...paramToUse,
					...param,
				};
				value = this.state.values ? this.state.values[param.name] : undefined;
			}

			const isRadio = paramToUse.controlType === 'radio';

			return isRadio ? (
				<RadioSlider
					disabled={paramToUse.disabled}
					init={paramToUse.init}
					label={paramToUse.label}
					max={paramToUse.max}
					maxAdvised={paramToUse.maxAdvised}
					min={paramToUse.min}
					minAdvised={paramToUse.minAdvised}
					name={paramToUse.name}
					child={paramToUse.child}
					key={paramToUse.name + i}
					value={value}
					state={paramToUse.state}
					individualized={individualized}
					controlType={paramToUse.controlType}
					radioValues={paramToUse.radioValues}
				/>
			) : (
				<Slider
					subscription={this.state.subscription}
					credits={this.props.credits}
					disabled={paramToUse.disabled}
					init={paramToUse.init}
					label={paramToUse.label}
					max={paramToUse.max}
					maxAdvised={paramToUse.maxAdvised}
					min={paramToUse.min}
					minAdvised={paramToUse.minAdvised}
					name={paramToUse.name}
					child={paramToUse.child}
					key={paramToUse.name + i}
					value={value}
					state={paramToUse.state}
					individualized={individualized}
					advanced={advancedMode}
				/>
			);
		});

		return <div className="sliders">{sliders}</div>;
	}
}

export class Slider extends React.PureComponent {
	constructor(props) {
		super(props);

		this.changeParam = this.changeParam.bind(this);
		this.resetValue = this.resetValue.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	resetValue() {
		this.client.dispatchAction('/change-param', {
			value: this.props.init,
			name: this.props.name,
			label: this.props.label,
			force: true,
		});
	}

	showTooltip(sliderName) {
		const selector = '#prototyposlidertooltip';
		const button = 'slider-tooltip';
		const outsideClick = (event) => {
			if (
				!event.target.closest(selector)
				&& event.target.className !== button
			) {
				this.client.dispatchAction('/store-value', {
					uiSliderTooltip: {display: false},
				});
				document.body.removeEventListener('click', outsideClick);
			}
			if (event.target.className === button) {
				document.body.removeEventListener('click', outsideClick);
			}
		};

		this.client.dispatchAction('/store-value', {
			uiSliderTooltip: {display: true, sliderName},
		});
		document.body.addEventListener('click', outsideClick);
	}

	changeParam(params) {
		this.client.dispatchAction('/change-param', params);
	}

	render() {
		const {
			name,
			min,
			max,
			minAdvised,
			maxAdvised,
			init,
			disabled,
			child,
			individualized,
			label,
			state,
			advanced,
		} = this.props;
		const value = this.props.value === undefined ? init : this.props.value;

		const classes = classNames({
			slider: true,
			'is-coming': disabled,
			'is-child': child,
		});

		const devOverlay = disabled && (
			<div className="slider-demo-overlay-text">
				This feature is currently in development
			</div>
		);

		const indivSwitch = individualized && (
			<IndivSwitch name={name} state={state} />
		);

		const sliderTooltipButton = !!SliderHelpText[name] && (
			<div
				className="slider-tooltip"
				onClick={() => {
					this.showTooltip(name);
				}}
			>
				?
			</div>
		);

		return (
			<div className={classes}>
				<div className="slider-demo-overlay">{devOverlay}</div>
				<label className="slider-title">{label}</label>
				{sliderTooltipButton}
				<div className="slider-reset" onClick={this.resetValue}>
					reset
				</div>
				<SliderTextController
					value={value}
					name={name}
					label={label}
					disabled={disabled}
					minAdvised={minAdvised}
					maxAdvised={maxAdvised}
					individualized={individualized}
					changeParam={this.changeParam}
				/>
				<div className="slider-container">
					<SliderController
						value={value}
						name={name}
						label={label}
						min={advanced ? min : minAdvised}
						max={advanced ? max : maxAdvised}
						minAdvised={minAdvised}
						maxAdvised={maxAdvised}
						disabled={disabled}
						changeParam={this.changeParam}
					/>
					{indivSwitch}
				</div>
			</div>
		);
	}
}

Slider.propTypes = {
	name: PropTypes.string,
	min: PropTypes.number.isRequired,
	max: PropTypes.number.isRequired,
	minAdvised: PropTypes.number,
	maxAdvised: PropTypes.number,
	value: PropTypes.number,
	init: PropTypes.number,
	disabled: PropTypes.bool,
	child: PropTypes.bool,
	individualized: PropTypes.bool,
	label: PropTypes.string,
	state: PropTypes.string,
	advanced: PropTypes.bool,
};

export class RadioSlider extends React.PureComponent {
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
		const value
			= this.props.value === undefined ? this.props.init : this.props.value;

		const classes = Classnames({
			slider: true,
			'radio-slider': true,
			'is-coming': this.props.disabled,
			'is-child': this.props.child,
		});

		const demoOverlay = this.props.disabled ? (
			<div className="slider-demo-overlay-text">
				This feature is currently in development
			</div>
		) : (
			false
		);

		const indivSwitch = this.props.individualized ? (
			<IndivSwitch name={this.props.name} state={this.props.state} />
		) : (
			false
		);

		return (
			<div className={classes}>
				<div className="slider-demo-overlay">{demoOverlay}</div>
				<label className="slider-title">{this.props.label}</label>
				<div className="slider-container">
					<SliderRadioController
						value={value}
						name={this.props.name}
						individualized={this.props.individualized}
						label={this.props.label}
						disabled={this.props.disabled}
						child={this.props.child}
						radioValues={this.props.radioValues}
					/>
					{indivSwitch}
				</div>
			</div>
		);
	}
}

export class SliderRadioController extends React.PureComponent {
	constructor(props) {
		super(props);

		this.handleChange = this.handleChange.bind(this);
	}

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
	}

	componentDidMount() {}

	componentWillUnmount() {
		this.lifespan.release();
	}

	handleChange(e) {
		if (e.target) {
			if (e.target.value !== undefined) {
				this.props.changeParam({
					value: e.target.value,
					name: this.props.name,
					label: this.props.label,
				});
			}
		}
	}

	render() {
		const boxes = this.props.radioValues.map(item => item.value);

		const checkBoxes = boxes.map((boxValue, index) => {
			const isSelected = boxValue === this.props.value;

			return (
				<div className="radio-button-container" key={index}>
					<label>
						<input
							onChange={this.handleChange}
							value={boxValue}
							checked={isSelected}
							type="radio"
							name={`radio-button-${String(
								this.props.name,
							).trim()}`}
						/>
						<span className="box-value-label">{boxValue}</span>
					</label>
				</div>
			);
		});

		return <div className="radio-buttons-wrap">{checkBoxes}</div>;
	}
}

export class SliderTextController extends React.PureComponent {
	constructor(props) {
		super(props);

		this.handleChange = this.handleChange.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
		this.state = {
			isTyping: false,
		};
	}

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	handleChange(e) {
		const value = e.target.value;

		this.props.changeParam({
			name: this.props.name,
			value: parseFloat(value),
			label: this.props.label,
		});
	}

	handleClick() {
		this.setState({isTyping: true});
	}

	handleBlur(e) {
		const value = e.target.value;

		this.setState({isTyping: false});
		this.props.changeParam({
			name: this.props.name,
			value: parseFloat(value),
			label: this.props.label,
			force: true,
		});
	}

	render() {
		const classes = classNames({
			'slider-text-controller': true,
			'is-indiv': this.props.individualized,
		});

		return (
			<input
				className={classes}
				type="number"
				value={
					this.state.isTyping
						? this.props.value
						: this.props.value.toFixed(2)
				}
				onChange={this.handleChange}
				onClick={this.handleClick}
				onBlur={this.handleBlur}
				disabled={this.props.disabled}
			/>
		);
	}
}

class IndivSwitch extends React.PureComponent {
	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
	}

	componentDidMount() {
		this.client.dispatchAction('/store-value', {
			uiJoyrideTutorialValue: indivGroupsEditionTutorialLabel,
		});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	changeState(state) {
		this.client.dispatchAction('/change-param-state', {
			name: this.props.name,
			state,
			label: this.props.label,
		});
	}

	render() {
		const indivRelative = classNames({
			'indiv-switch-btn': true,
			'indiv-switch-relative': true,
			'is-active': this.props.state === 'relative',
		});

		const indivDelta = classNames({
			'indiv-switch-btn': true,
			'indiv-switch-delta': true,
			'is-active': this.props.state === 'delta',
		});

		return (
			<div className="indiv-switch">
				<div
					className={indivRelative}
					onClick={() => {
						this.changeState('relative');
					}}
				>
					&times;
				</div>
				<div
					className={indivDelta}
					onClick={() => {
						this.changeState('delta');
					}}
				>
					+
				</div>
			</div>
		);
	}
}
