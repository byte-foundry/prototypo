import React from 'react';

import InputWithLabel from './input-with-label.components.jsx';

export default class AddCard extends React.Component {

	data() {
		return {
			fullname: this.refs.fullname.inputValue,
			number: this.refs.number.inputValue,
			expMonth: this.refs.expMonth.inputValue,
			expYear: this.refs.expYear.inputValue,
			cvc: this.refs.cvc.inputValue,
		};
	}

	render() {
		return (
			<div className="add-card">
				<InputWithLabel ref="fullname" label="Full name" error={this.props.inError.fullname} info="(as it appears on the card)" required={true}/>
				<InputWithLabel ref="number" label="Card number" error={this.props.inError.number} required={true} placeholder="1111222233334444" cleaveOptions={{creditCard: true}}/>
				<div className="columns">
					<div className="third-column">
						<InputWithLabel ref="expMonth" label="Expiration date" error={this.props.inError.expMonth} required={true} placeholder="Month" cleaveOptions={{date: true, datePattern: ['m']}}/>
					</div>
					<div className="third-column">
						<InputWithLabel ref="expYear" label="&nbsp;" error={this.props.inError.expYear} required={false} placeholder="Year" cleaveOptions={{date: true, datePattern: ['Y']}}/>
					</div>
					<div className="third-column">
						<InputWithLabel ref="cvc" label="CVC" error={this.props.inError.cvc} required={true} placeholder="123"/>
					</div>
				</div>
			</div>
		);
	}
}
