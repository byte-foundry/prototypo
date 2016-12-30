import React from 'react';

import InputWithLabel from './input-with-label.components.jsx';
import Cleave from 'cleave.js/dist/cleave-react.min';

export default class AddCard extends React.PureComponent {
	data() {
		return {
			fullname: this.fullname.value,
			number: this.number.rawValue,
			expMonth: parseInt(this.expiration.rawValue.slice(0, 2)),
			expYear: parseInt(this.expiration.rawValue.slice(2)),
			cvc: this.cvc.value,
		};
	}

	handleNumberChange(event) {
		if (event.target.rawValue.length === 16) {
			this.expiration.focus();
		}
	}

	handleExpirationChange(event) {
		if (event.target.rawValue.length === 4) {
			this.cvc.focus();
		}
	}

	render() {
		const {inError} = this.props;

		return (
			<div className="add-card">
				<InputWithLabel inputRef={(ref) => { this.fullname = ref; }} label="Full name" error={inError.fullname} info="(as it appears on the card)" required={true}/>
				<InputWithLabel label="Card number" error={inError.number} required={true}>
					<Cleave
						htmlRef={(ref) => { this.number = ref; }}
						placeholder="1111 2222 3333 4444"
						options={{creditCard: true}}
						onChange={this.handleNumberChange.bind(this)}
					/>
				</InputWithLabel>
				<div className="columns">
					<div className="third-column">
						<InputWithLabel label="Expiration date" error={inError.expMonth} required={true}>
							<Cleave
								htmlRef={(ref) => { this.expiration = ref; }}
								placeholder="MM/YY"
								options={{date: true, datePattern: ['m', 'y']}}
								onChange={this.handleExpirationChange.bind(this)}
							/>
						</InputWithLabel>
					</div>
					<div className="third-column">
						<InputWithLabel inputRef={(ref) => { this.cvc = ref; }} label="CVC" error={inError.cvc} required={true} placeholder="123" maxLength="3" />
					</div>
				</div>
			</div>
		);
	}
}
