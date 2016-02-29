import React from 'react';
import InputWithLabel from '../shared/input-with-label.components.jsx';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';

export default class SubscriptionAccountInfo extends React.Component {
	render() {
		return (
			<div className="account-base subscription-account-info">
				<div className="columns">
					<div className="half-column">
						<InputWithLabel label="First name" required={true} placeholder="mj"/>
					</div>
					<div className="half-column">
						<InputWithLabel label="Last name" required={false} placeholder="thecat"/>
					</div>
				</div>
				<InputWithLabel label="Your email" required={true} placeholder="mj@prototypo.io"/>
				<InputWithLabel label="Password" required={true} placeholder="**********"/>
				<AccountValidationButton label="Sign up"/>
			</div>
		);
	}
}
