import React from 'react';

export default class InputWithLabel extends React.Component {
	render() {
		const required = this.props.required
			? <span className="input-with-label-label-required">*</span>
			: false;

		return (
			<div className="input-with-label">
				<label className="input-with-label-label">{this.props.label}{required}</label>
				<input className="input-with-label-input" placeholder={this.props.placeholder}/>
			</div>
		);
	}
}
