import React from 'react';
import Select from 'react-select';
import Classnames from 'classnames';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default class SelectWithLabel extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			value: props.inputValue,
			inputValue: '',
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	handleChangeValue(value) {
		this.setState({
			value,
		});
	}

	handleChangeInput(inputValue) {
		this.setState({
			inputValue,
		});
	}

	render() {
		const required = this.props.required
			? <span className="input-with-label-label-required">*</span>
			: false;

		const inputClass = Classnames({
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
				<Select
					ref="input"
					className={inputClass}
					options={this.props.options}
					placeholder={this.props.placeholder}
					noResultsText={this.props.noResultsText}
					onChange={(value) => {this.handleChangeValue(value);}}
					onInputChange={(value) => {this.handleChangeInput(value);}}
					value={this.state.value}/>
			</div>
		);
	}

	get inputValue() {
		const selectValue = this.refs
			? this.refs.input.props.value
			: undefined;

		const inputValue = this.state
			? {value: this.state.inputValue}
			: undefined;

		return selectValue || inputValue;
	}

	set inputValue(value) {
		return;
	}
}
