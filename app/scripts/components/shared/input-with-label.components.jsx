import React from 'react';
import classNames from 'classnames';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default class InputWithLabel extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	static defaultProps = {
		handleOnChange: () => { return; },
	}

	render() {
		const {
			handleOnChange,
			error, warning, info,
			label, placeholder, inputValue, required,
			...rest,
		} = this.props;

		const inputClass = classNames('input-with-label-input', {
			'is-error': error,
			'is-warning': warning,
		});

		return (
			<div className="input-with-label">
				<label className="input-with-label-label">
					{label}
					{info && <span className="input-with-label-label-info">{info}</span>}
					{required && <span className="input-with-label-label-required">*</span>}
				</label>
				<input {...rest}
					ref="input"
					className={inputClass}
					placeholder={placeholder}
					defaultValue={inputValue}
					onChange={handleOnChange}
				/>
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
