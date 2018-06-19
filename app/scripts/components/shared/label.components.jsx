import React from 'react';
import classNames from 'classnames';

export default class Label extends React.Component {
	constructor(props) {
		super(props);

		this.renderChildren = this.renderChildren.bind(this);
	}

	renderChildren() {
		const {error, warning, children} = this.props;

		const inputClass = classNames({
			'input-with-label-input': true,
			'is-error': error,
			'is-warning': warning,
		});

		return React.Children.map(children, child => React.cloneElement(child, {
			className: `${child.props.className || ''} ${inputClass}`,
		}));
	}

	render() {
		const required = this.props.required ? (
			<span className="input-with-label-label-required">*</span>
		) : (
			false
		);

		const info = this.props.info ? (
			<span className="input-with-label-label-info">{this.props.info}</span>
		) : (
			false
		);

		return (
			<div className="input-with-label">
				<label className="input-with-label-label">
					{this.props.label}
					{info}
					{required}
				</label>
				{this.renderChildren()}
			</div>
		);
	}
}
