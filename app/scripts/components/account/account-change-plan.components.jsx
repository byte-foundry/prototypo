import React from 'react';
import InputWithLabel from '../shared/input-with-label.components.jsx';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';

export default class AccountChangePlan extends React.Component {
	render() {
		return (
			<div className="account-base account-change-plan">
				<InputWithLabel label="Your plan" />
				<p className="account-change-plan-downgrade hidden">
					<span className="account-bold">To downgrade your account, shoot us an email at </span><a className="account-email" href="mailto:account@prototypo.io?subject=Cancelling my subscription&body=Hi,%0A%0A I would like to cancel my subscription to Prototypo.%0A">account@prototypo.io</a><span className="account-bold">, we will do the rest! :)</span>
					<br/><br/>Cheers,<br/> The Prototypo team
				</p>
				<AccountValidationButton label="Confirm plan change"/>
			</div>
		);
	}
}
