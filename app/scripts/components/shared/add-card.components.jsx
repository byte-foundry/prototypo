import React from 'react';
import classNames from 'classnames';
import {CardElement} from 'react-stripe-elements';

import InputWithLabel from './input-with-label.components';

export default class AddCard extends React.PureComponent {
	render() {
		const {inError, className} = this.props;

		const classes = classNames('add-card', className);

		return (
			<div className={classes}>
				<InputWithLabel
					id="add-card-fullname"
					name="fullname"
					label="Full name"
					error={inError.fullname}
					info="(as it appears on the card)"
					required={true}
					spellCheck="false"
				/>
				<div className="input-with-subline">
					<InputWithLabel label="Card number" required>
						<CardElement
							classes={{
								base: 'input-with-label-input',
								focus: 'is-focus',
								invalid: 'is-error',
							}}
							style={{
								base: {
									color: '#7e7e7e',
									fontFamily: "'Fira Sans', sans-serif",
									fontSize: '16px',
									'::placeholder': {
										color: '#C6C6C6',
									},
								},
							}}
						/>
					</InputWithLabel>
				</div>
				<div className="input-card-subline">
					<a href="https://stripe.com/" target="_blank">
						<img
							className="input-card-subline-poweredbystripe"
							src="assets/images/powered_by_stripe.svg"
							alt="powered by stripe"
						/>
					</a>
				</div>
			</div>
		);
	}
}
