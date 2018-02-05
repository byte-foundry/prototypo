import React from 'react';
import PropTypes from 'prop-types';

class InputNumber extends React.Component {
	constructor(props) {
		super(props);

		const value = isNaN(parseFloat(props.value)) ? props.defaultValue : parseFloat(props.value);

		this.state = {
			value: value || 0,
			textValue: value,
		};

		this.increment = this.increment.bind(this);
		this.decrement = this.decrement.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
		this.changeValue = this.changeValue.bind(this);
	}

	componentWillReceiveProps({value, defaultValue}) {
		if (isNaN(value)) {
			return this.changeValue(defaultValue);
		}
		return this.changeValue(value, false);
	}

	increment() {
		this.changeValue(this.state.value + this.props.step);
	}

	decrement() {
		this.changeValue(this.state.value - this.props.step);
	}

	handleChange(e) {
		this.changeValue(e.target.value);
	}

	handleBlur() {
		this.setState(({value}) => ({textValue: value.toString()}));
	}

	changeValue(newValue, notify = true) {
		const {min, max, onChange} = this.props;

		// Text field is valid
		if (/^-?(\d+(\.\d*)?)?$/.test(newValue)) {
			this.setState({textValue: newValue});
		}

		// Not a number we'd like, so we don't set the new value
		if (!/^-?\d+(\.\d+)?$/.test(newValue)) {
			return;
		}

		// Good number, range validation
		const value = Math.max(min, Math.min(parseFloat(newValue), max));

		this.setState(() => {
			if (notify || value !== newValue) {
				onChange(value);
			}

			if (typeof newValue === 'number') {
				return {value, textValue: value.toString()};
			}
			return {value};
		});
	}

	render() {
		const {textValue} = this.state;
		const {className, onChange, step, min, max, controls, ...rest} = this.props;

		delete rest.value;

		return (
			<div className={className}>
				{controls
					&& <button className="input-number-decrement" onClick={this.decrement}>
						–
					</button>}
				<input
					className="input-number"
					type="text"
					value={textValue}
					onChange={this.handleChange}
					onBlur={this.handleBlur}
					{...rest}
				/>
				<span className="input-number-text">users</span>
				{controls
					&& <button className="input-number-increment" onClick={this.increment}>
						+
					</button>}
			</div>
		);
	}
}

InputNumber.propTypes = {
	className: PropTypes.string,
	defaultValue: PropTypes.number,
	value: PropTypes.number,
	step: PropTypes.number,
	min: PropTypes.number,
	max: PropTypes.number,
	controls: PropTypes.bool,
};

InputNumber.defaultProps = {
	value: 0,
	step: 1,
	min: -Infinity,
	max: Infinity,
	controls: false,
};

export default InputNumber;
