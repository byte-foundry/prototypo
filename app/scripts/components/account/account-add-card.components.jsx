import React from 'react';
import AddCard from '../shared/add-card.components.jsx';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';

export default class AccountAddCard extends React.Component {
	render() {
		return (
			<div className="account-base account-add-card">
				<AddCard />
				<AccountValidationButton label="Confirm plan change"/>
			</div>
		);
	}
}
