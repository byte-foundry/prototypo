import React from 'react';
import AddCard from '../shared/add-card.components.jsx';
import InputWithLabel from '../shared/input-with-label.components.jsx';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';

export default class SubscriptionAddCard extends React.Component {
	render() {
		return (
			<div className="account-base subscription-add-card">
				<AddCard />
				<InputWithLabel label="VAT number"/>
				<AccountValidationButton label="Add my card"/>
			</div>
		);
	}
}
