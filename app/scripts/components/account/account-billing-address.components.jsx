import React from 'react';
import BillingAddress from '../shared/billing-address.components.jsx';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';

export default class AccountBillingAddress extends React.Component {
	render() {
		return (
			<div className="account-base account-billing-address">
				<BillingAddress />
				<AccountValidationButton label="Confirm plan change"/>
			</div>
		);
	}
}
