import React from 'react';

import InputWithLabel from './input-with-label.components.jsx';
import Cleave from 'cleave.js/dist/cleave-react.min';

export default class AddCard extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			creditCardType: '',
		};
	}

	data() {
		return {
			fullname: this.fullname.value,
			number: this.number.rawValue,
			expMonth: parseInt((this.expiration.rawValue || '00/00').slice(0, 2)),
			expYear: parseInt((this.expiration.rawValue || '00/00').slice(2)),
			cvc: this.cvc.value,
		};
	}

	handleNumberChange(event) {
		if (event.target.rawValue.length === 16) {
			this.expiration.focus();
		}
	}

	onCreditCardTypeChanged(type) {
		this.setState({creditCardType: type});
	}

	handleExpirationChange(event) {
		if (event.target.rawValue.length === 4) {
			this.cvc.focus();
		}
	}

	render() {
		const {inError} = this.props;

		return (
			<div className={`${this.props.className} add-card`}>
				<InputWithLabel
					inputRef={(ref) => {
						this.fullname = ref;
					}}
					label="Full name"
					error={inError.fullname}
					info="(as it appears on the card)"
					required={true}
				/>
				<div
					className={`input-with-subline ${
						this.state.creditCardType === 'unknown'
							? ''
							: this.state.creditCardType
					}`}
				>
					<InputWithLabel
						label="Card number"
						error={inError.number}
						required={true}
					>
						<Cleave
							htmlRef={(ref) => {
								this.number = ref;
							}}
							placeholder="1111 2222 3333 4444"
							options={{
								creditCard: true,
								onCreditCardTypeChanged: this.onCreditCardTypeChanged.bind(
									this,
								),
							}}
							onChange={this.handleNumberChange.bind(this)}
						/>
					</InputWithLabel>
				</div>
				<div className="input-card-subline clearfix">
					<a href="https://stripe.com/" target="_blank">
						<img
							className="input-card-subline-poweredbystripe"
							src="assets/images/powered_by_stripe.svg"
							alt="powered by stripe"
						/>
					</a>
				</div>
				<div className="columns">
					<div className="third-column">
						<InputWithLabel
							label="Expiration date"
							error={inError.expMonth}
							required={true}
						>
							<Cleave
								htmlRef={(ref) => {
									this.expiration = ref;
								}}
								placeholder="MM/YY"
								options={{date: true, datePattern: ['m', 'y']}}
								onChange={this.handleExpirationChange.bind(this)}
							/>
						</InputWithLabel>
					</div>
					<div className="third-column">
						<InputWithLabel
							inputRef={(ref) => {
								this.cvc = ref;
							}}
							label="CVC"
							error={inError.cvc}
							required={true}
							placeholder="123"
							maxLength="4"
						/>
					</div>
				</div>
			</div>
		);
	}
}
