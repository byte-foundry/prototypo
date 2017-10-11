import React from 'react';
import AddCard from '../shared/add-card.components.jsx';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';
import Lifespan from 'lifespan';

import LocalClient from '../../stores/local-client.stores.jsx';
import FormError from '../shared/form-error.components.jsx';

export default class AccountAddCard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			errors: [],
			inError: {},
		};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					loading: head.toJS().d.addcardForm.loading,
					errors: head.toJS().d.addcardForm.errors,
					inError: head.toJS().d.addcardForm.inError,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.client.dispatchAction('/clean-form', 'addcardForm');
		this.lifespan.release();
	}

	addCard(e) {
		e.preventDefault();
		e.stopPropagation();
		this.client.dispatchAction('/add-card', {
			card: this.refs.card.data(),
			pathQuery: {
				path: '/account/details',
				query: {newCard: true},
			},
		});
	}

	render() {
		const errors = this.state.errors.map((error) => {
			return <FormError errorText={error} />;
		});

		return (
			<form onSubmit={(e) => {this.addCard(e);}} className="account-base account-add-card">
				<AddCard ref="card" inError={this.state.inError}/>
				{errors}
				<AccountValidationButton loading={this.state.loading} label="Add card"/>
			</form>
		);
	}
}
