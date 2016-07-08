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

		//function binding
		this.addCard = this.addCard.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					loading: head.toJS().addcardForm.loading,
					errors: head.toJS().addcardForm.errors,
					inError: head.toJS().addcardForm.inError,
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
			<form onSubmit={this.addCard} className="account-base account-add-card">
				<AddCard ref="card" inError={this.state.inError}/>
				{errors}
				<AccountValidationButton loading={this.state.loading} label="Change card"/>
			</form>
		);
	}
}
