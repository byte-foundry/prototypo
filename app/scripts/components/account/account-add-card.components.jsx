import React from 'react';
import {Elements} from 'react-stripe-elements';

import AddCardForm from '../add-card-form.components';
import Dashboard from './account-dashboard.components';

class AccountAddCard extends React.Component {
	render() {
		return (
			<Dashboard title="Add a card">
				<Elements locale="en">
					<AddCardForm />
				</Elements>
			</Dashboard>
		);
	}
}

export default AccountAddCard;
