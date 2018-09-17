import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import DOM from '../helpers/dom.helpers';

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
		const {min, max, label, name, disabled, changeParam} = this.props;

		if (disabled) {
			return;
		}

		this.setState({tracking: true});
		const newX = e.pageX || e.screenX;
		const {offsetLeft} = DOM.getAbsOffset(this.node);
		let newValue
			= ((newX - offsetLeft) / this.node.offsetWidth * (max - min)) + min;

		newValue = Math.min(Math.max(newValue, min), max);

		changeParam({value: newValue, name, label});
		this.currentX = newX;

		e.stopPropagation();
	}

	handleUp(e) {
		if (!this.state.tracking) {
			return;
		}

		const {value, name, label, changeParam} = this.props;

		this.setState({tracking: false});
		changeParam({value, name, label, force: true});

		e.stopPropagation();
	}

	handleMove(e) {
		if (!this.state.tracking) {
			return;
		}

		const {min, max, value, name, changeParam} = this.props;

		const newX = e.pageX || e.screenX;
		const {offsetLeft} = DOM.getAbsOffset(this.node);
		let newValue;

		if (newX >= offsetLeft && newX <= offsetLeft + this.node.clientWidth) {
			const variation
				= (newX - this.currentX) / this.node.offsetWidth * (max - min);

			newValue = value + variation;

			newValue = Math.min(Math.max(newValue, min), max);
		}
		else {
			newValue = newX < offsetLeft ? min : max;
		}

		changeParam({value: newValue, name});
		this.currentX = newX;
	}

	// This prevents preview text to be selected whil using the sliders
	handleSelectstart(e) {
		if (this.state.tracking) {
			e.preventDefault();
		}
	}

	render() {
		const {min, max, value, className} = this.props;
		const ratio = 96.0;

		const minAdvised
			= typeof this.props.minAdvised === 'number'
				? this.props.minAdvised
				: min;
		const maxAdvised
			= typeof this.props.maxAdvised === 'number'
				? this.props.maxAdvised
				: max;

		const translateX
			= (max - Math.min(Math.max(value, min), max)) / (max - min) * ratio;

		const transform = {
			transform: `translateX(-${translateX}%)`,
		};

		const sliderClasses = classNames('slider-controller', className);
		const classes = classNames({
			'slider-controller-bg': true,
			'is-not-advised': value < minAdvised || value > maxAdvised,
		});

		return (
			<div
				className={sliderClasses}
				ref={(node) => {
					this.node = node;
				}}
				onMouseDown={this.handleDown}
			>
				<div className={classes} style={transform}>
					<div className="slider-controller-handle" />
				</div>
			</div>
		);
	}
}

SliderController.defaultProps = {
	disabled: false,
	min: 0,
	max: 100,
	className: '',
};

SliderController.propTypes = {
	disabled: PropTypes.bool,
	min: PropTypes.number,
	max: PropTypes.number,
	minAdvised: PropTypes.number,
	maxAdvised: PropTypes.number,
	className: PropTypes.string,
};
