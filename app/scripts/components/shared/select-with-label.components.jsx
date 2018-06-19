import React from 'react';
import Select from 'react-select';
import classNames from 'classnames';

export default class SelectWithLabel extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			value: props.options.find(({value}) => value === props.inputValue),
			inputValue: '',
		};
	}

	handleChangeValue(value) {
		if (Array.isArray(value)) {
			this.setState({
				value: undefined,
			});
		}
		else {
			this.setState({
				value,
			});
		}
	}

	handleChangeInput(inputValue) {
		this.setState({
			inputValue,
			value: undefined,
		});
	}

	render() {
		const {label, info, required, name, ...selectProps} = this.props;
		const {value} = this.state;

		const inputClass = classNames({
			'input-with-label-input': true,
			'is-error': this.props.error,
			'is-warning': this.props.warning,
		});

		return (
			<div className="input-with-label">
				<label className="input-with-label-label">
					{label}
					{info && <span className="input-with-label-label-info">{info}</span>}
					{required && (
						<span className="input-with-label-label-required">*</span>
					)}
				</label>
				<Select
					{...selectProps}
					ref="input"
					className={inputClass}
					onChange={(value) => {
						this.handleChangeValue(value);
					}}
					onBlurResetsInput={false}
					onInputChange={(value) => {
						this.handleChangeInput(value);
					}}
					value={value}
				/>
				<input type="hidden" name={name} value={(value && value.value) || ''} />
			</div>
		);
	}

	get inputValue() {
		const selectValue = this.refs ? this.refs.input.props.value : undefined;

		const inputValue = this.state ? {value: this.state.inputValue} : undefined;

		return selectValue || inputValue;
	}

	set inputValue(value) {}
}
