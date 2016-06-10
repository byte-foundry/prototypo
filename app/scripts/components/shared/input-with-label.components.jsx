import React from 'react';
import Classnames from 'classnames';

export default class InputWithLabel extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
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
				<input {...this.props} ref="input" className={inputClass} placeholder={this.props.placeholder} defaultValue={this.props.inputValue}/>
			</div>
		);
	}

	get inputValue() {
		return this.refs ? this.refs.input.value : undefined;
	}

	set inputValue(value) {
		return;
	}
}
