import React from 'react';
import Select from 'react-select';
import classNames from 'classnames';

export default class SelectWithLabel extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			value: props.inputValue,
		};
	}

	handleChangeValue(value) {
		this.setState({
			value,
		})
	}

	render() {
		const required = this.props.required
			? <span className="input-with-label-label-required">*</span>
			: false;

		const inputClass = classNames({
			'input-with-label-input': true,
			'is-error': this.props.error,
			'is-warning': this.props.warning,
		});

		const info = this.props.info
			? <span className="input-with-label-label-info">{this.props.info}</span>
			: false;

		return (
			<div className="input-with-label">
				<label className="input-with-label-label">{this.props.label}{info}{required}</label>
				<Select ref="input" className="{inputClass}" options={this.props.options} onChange={(value) => {this.handleChangeValue(value)}} value={this.state.value}/>
			</div>
		);
	}

	get inputValue() {
		return this.refs ? this.refs.input.props.value : undefined;
	}

	set inputValue(value) {
		return;
	}
}
