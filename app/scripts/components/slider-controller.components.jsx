import React from 'react';
import classNames from 'classnames';

import DOM from '../helpers/dom.helpers.js';

export default class SliderController extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			tracking: false,
		};

		// function bindings
		this.handleDown = this.handleDown.bind(this);
		this.handleUp = this.handleUp.bind(this);
		this.handleMove = this.handleMove.bind(this);
		this.handleSelectstart = this.handleSelectstart.bind(this);
		this.restrictedRangeEnter = this.restrictedRangeEnter.bind(this);
	}

	componentWillMount() {
		document.addEventListener('mouseup', this.handleUp);
		window.addEventListener('mousemove', this.handleMove);
		document.addEventListener('selectstart', this.handleSelectstart);
	}

	componentWillUnmount() {
		document.removeEventListener('mouseup', this.handleUp);
		window.removeEventListener('mousemove', this.handleMove);
		document.removeEventListener('selectstart', this.handleSelectstart);
	}

	handleDown(e) {
		if (this.props.disabled) {
			return;
		}

		this.setState({tracking: true});
		const newX = e.pageX || e.screenX;
		const {offsetLeft} = DOM.getAbsOffset(this.node);
		let newValue = ((newX - offsetLeft) / this.node.offsetWidth * (this.props.max - this.props.min)) + this.props.min;

		newValue = Math.min(Math.max(newValue, this.props.realMin), this.props.realMax);

		this.props.changeParam({value: newValue, name: this.props.name, label: this.props.label});
		this.currentX = newX;

		e.stopPropagation();
	}

	handleUp(e) {
		if (!this.state.tracking) {
			return;
		}

		this.setState({tracking: false});
		this.props.changeParam({
			value: this.props.value, name: this.props.name, label: this.props.label, force: true,
		});

		e.stopPropagation();
	}

	restrictedRangeEnter(e) {
		this.props.onRestrictedRangeEnter();

		e.stopPropagation();
	}

	handleMove(e) {
		if (!this.state.tracking) {
			return;
		}

		const newX = e.pageX || e.screenX;
		const {offsetLeft} = DOM.getAbsOffset(this.node);
		let newValue;

		if (newX >= offsetLeft && newX <= offsetLeft + this.node.clientWidth) {
			const variation = (newX - this.currentX) / this.node.offsetWidth * (this.props.max - this.props.min);

			newValue = this.props.value + variation;

			newValue = Math.min(Math.max(newValue, this.props.realMin), this.props.realMax);
		}
		else {
			newValue = newX < offsetLeft ? this.props.realMin : this.props.realMax;
		}

		this.props.changeParam({value: newValue, name: this.props.name});
		this.currentX = newX;
	}

	// This prevents preview text to be selected whil using the sliders
	handleSelectstart(e) {
		if (this.state.tracking) {
			return e.preventDefault();
		}
	}

	render() {
		const translateX = (this.props.max - Math.min(Math.max(this.props.value, this.props.min), this.props.max)) / (this.props.max - this.props.min) * 96.0;
		const translateDemoMin = (this.props.max - this.props.realMin) / (this.props.max - this.props.min) * 96.0;
		const translateDemoMax = 100 - ((this.props.max - this.props.realMax) / (this.props.max - this.props.min) * 96.0);
		const transform = {
			transform: `translateX(-${translateX}%)`,
		};
		const transformDemoMin = {
			transform: `translateX(-${translateDemoMin}%)`,
			marginLeft: '-10px',
		};
		const transformDemoMax = {
			transform: `translateX(${translateDemoMax}%)`,
			marginLeft: '-10px',
		};

		const classes = classNames({
			'slider-controller-bg': true,
			'is-not-advised': this.props.value < this.props.minAdvised || this.props.value > this.props.maxAdvised,
			'is-indiv': this.props.individualized,
		});

		const demoClassesMin = classNames({
			'slider-range-limiter-bg': true,
			min: true,
		});

		const demoClassesMax = classNames({
			'slider-range-limiter-bg': true,
			max: true,
		});

		return (
			<div className="slider-controller" ref={(node) => {this.node = node;}} onMouseDown={this.handleDown}>
				<div className={classes} style={transform}>
					<div className="slider-controller-handle" />
				</div>
				{this.props.demo && (
					<span>
						<div onClick={this.restrictedRangeEnter} className={demoClassesMin} style={transformDemoMin} />
						<div onClick={this.restrictedRangeEnter} className={demoClassesMax} style={transformDemoMax} />
					</span>
				)}
			</div>
		);
	}
}
