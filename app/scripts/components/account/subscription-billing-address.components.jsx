import React from 'react';
import BillingAddress from '../shared/billing-address.components.jsx';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';

export default class SubscriptionBillingAddress extends React.Component {
	render() {
		return (
			<div className="account-base subscription-billing-address">
				<BillingAddress />
				<AccountValidationButton label="Add my address"/>
			</div>
		);
	}
}
