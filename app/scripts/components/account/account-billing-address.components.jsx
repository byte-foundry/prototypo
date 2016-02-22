import React from 'react';
import BillingAddress from '../shared/billing-address.components.jsx';

export default class AccountBillingAddress extends React.Component {
	render() {
		return (
			<div className="account-billing-address">
				<BillingAddress />
			</div>
		);
	}
}
