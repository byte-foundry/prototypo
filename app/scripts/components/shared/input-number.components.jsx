import React from 'react';
import PropTypes from 'prop-types';

class InputNumber extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			value: props.value,
			textValue: props.value,
		};

		this.increment = this.increment.bind(this);
		this.decrement = this.decrement.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
		this.changeValue = this.changeValue.bind(this);
	}

	componentWillReceiveProps({value}) {
		if (value.toString() !== this.state.textValue) {
			this.setState({value, textValue: value.toString()});
		}
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

	changeValue(newValue) {
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
			onChange(value);

			if (typeof newValue === 'number') {
				return {value, textValue: value.toString()};
			}
			return {value};
		});
	}

	render() {
		const {textValue} = this.state;
		const {onChange, step, min, max, controls, ...rest} = this.props;

		delete rest.value;

		return (
			<div className="pricing-item-subtitle-price-info agency">
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
