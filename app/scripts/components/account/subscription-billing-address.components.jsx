import React from 'react';
import Lifespan from 'lifespan';

import BillingAddress from '../shared/billing-address.components.jsx';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';
import DisplayWithLabel from '../shared/display-with-label.components.jsx';

import LocalClient from '../../stores/local-client.stores.jsx';
import FormError from '../shared/form-error.components.jsx';

export default class SubscriptionBillingAddress extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			errors: [],
			inError: {},
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
					errors: head.toJS().billingForm.errors,
					inError: head.toJS().billingForm.inError,
					loading: head.toJS().billingForm.loading,
					infos: head.toJS().infos,
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
		});
	}

	render() {
		const errors = this.state.errors.map((error) => {
			return <FormError errorText={error} />;
		});
		const oldBillingData = this.state.infos && this.state.infos.address
			? (
				<div>
					<div>{this.state.infos.buyerName}</div>
					<div>{this.state.infos.address.building_number} {this.state.infos.address.street_name}</div>
					<div>{this.state.infos.address.address_details}</div>
					<div>{this.state.infos.address.city} {this.state.infos.address.postal_code}</div>
					<div>{this.state.infos.address.region} {this.state.infos.address.country}</div>
				</div>
			)
			: false;
		const oldBilling = oldBillingData
			? (
				<div className="columns">
					<div className="third-column">
						You already added a billing address
					</div>
					<div className="two-third-column">
						<DisplayWithLabel nolabel={true} data={oldBillingData}/>
					</div>
				</div>
			)
			: false;

		return (
			<form onSubmit={this.addAddress} className="account-base subscription-billing-address">
				{oldBilling}
				<BillingAddress address={{}} inError={this.state.inError} ref="address"/>
				{errors}
				<AccountValidationButton loading={this.state.loading} label="Add my address"/>
			</form>
		);
	}
}
