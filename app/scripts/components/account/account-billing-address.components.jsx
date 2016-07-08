import React from 'react';
import Lifespan from 'lifespan';

import BillingAddress from '../shared/billing-address.components.jsx';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';
import FormError from '../shared/form-error.components.jsx';
import FormSuccess from '../shared/form-success.components.jsx';

import LocalClient from '../../stores/local-client.stores.jsx';

export default class AccountBillingAddress extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			inError: {},
			errors: [],
		};

		//function binding
		this.addAddress = this.addAddress.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					address: head.toJS().infos.address,
					buyerName: head.toJS().infos.buyerName,
					errors: head.toJS().billingForm.errors,
					inError: head.toJS().billingForm.inError,
					loading: head.toJS().billingForm.loading,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.client.dispatchAction('/clean-form', 'billingForm');
		this.lifespan.release();
	}

	addAddress(e) {
		e.preventDefault();
		this.client.dispatchAction('/add-billing-address', {
			buyerName: this.refs.address.getBuyerName(),
			address: this.refs.address.getAddress(),
			pathQuery: {
				path: '/account/details/billing-address',
				query: {
					newBilling: true,
				},
			},
		});
	}

	render() {
		const billingAddress = this.state.address
			? <BillingAddress ref="address" address={this.state.address} buyerName={this.state.buyerName} inError={this.state.inError}/>
			: false;

		const errors = this.state.errors.map((err) => {
			return <FormError errorText={err}/>;
		});

		const success = this.props.location.query.newBilling
			? <FormSuccess successText="You've successfully changed your billing address"/>
			: false;

		return (
			<form onSubmit={this.addAddress} className="account-base account-billing-address">
				{billingAddress}
				{errors}
				{success}
				<AccountValidationButton loading={this.state.loading} label="Confirm plan change"/>
			</form>
		);
	}
}
