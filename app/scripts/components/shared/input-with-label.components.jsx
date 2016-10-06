import React from 'react';
import classNames from 'classnames';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import Cleave from 'cleave.js/dist/cleave-react.min';

export default class InputWithLabel extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
		this.handleOnChange = this.handleOnChange.bind(this);
		this.state = {
      value: '',
    };
	}

	handleOnChange(event) {
		this.props.cleaveOptions
		? this.setState({value: event.target.rawValue})
		: this.setState({value: event.target.value});
		return;
	}

	render() {
		const {
			handleOnChange,
			error, warning, info,
			label, placeholder, inputValue, required,
			cleaveOptions,
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
				{cleaveOptions
					?	<Cleave {...rest}
						ref="input"
						className={inputClass}
						placeholder={placeholder}
						defaultValue={inputValue}
						options={cleaveOptions}
						onChange={this.handleOnChange}
					/>
					: <input {...rest}
						ref="input"
						className={inputClass}
						placeholder={placeholder}
						defaultValue={inputValue}
						onChange={this.handleOnChange}
					/>
			}
			</div>
		);
	}

	get inputValue() {
		// TODO: get the correct imput value
		return this.refs ? this.state.value : undefined;
	}

	set inputValue(value) {
		return;
	}
}
