import React from 'react';
import {compose, graphql, gql} from 'react-apollo';

import HoodieApi from '../../services/hoodie.services';

import BillingAddress from '../shared/billing-address.components';
import AccountValidationButton from '../shared/account-validation-button.components';
import FormError from '../shared/form-error.components';
import FormSuccess from '../shared/form-success.components';
import WaitForLoad from '../wait-for-load.components';

class AccountBillingAddress extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			errors: '',
			inError: [],
		};

		this.handleSubmit = this.handleSubmit.bind(this);
	}

	async handleSubmit(e) {
		e.preventDefault();

		this.setState({errors: '', inError: [], loadingForm: false});

		const buyerName = e.target.buyer_name.value;
		const buildingNumber = e.target.building_number.value;
		const streetName = e.target.street_name.value;
		const city = e.target.city.value;
		const postalCode = e.target.postal_code.value;
		const region = e.target.region.value;
		const country = e.target.country.value;
		const vat = e.target.vat.value;

		try {
			if (!buyerName || !buildingNumber || !streetName || !city || !postalCode || !country) {
				this.setState({
					inError: {
						buyerName: !buyerName,
						buildingNumber: !buildingNumber,
						streetName: !streetName,
						city: !city,
						postalCode: !postalCode,
						country: !country,
					},
				});
				throw new Error('These fields are required');
			}

			this.setState({loadingForm: true});

			await HoodieApi.updateCustomer({
				business_vat_id: vat, // Stripe way of storing VAT
				metadata: {
					street_line_1: buildingNumber,
					street_line_2: streetName,
					city,
					region,
					postal_code: postalCode,
					country,
					vat_number: vat, // Quaderno way of reading VAT
				},
			});

			await this.props.updateAddress({
				buyerName,
				buildingNumber,
				streetName,
				city,
				postalCode,
				region,
				country,
				vat,
			});

			this.setState({loadingForm: false});

			this.props.history.push({
				pathname: '/account/details/billing-address',
				query: {success: true},
			});
		}
		catch (err) {
			this.setState({errors: err.message, loadingForm: false});
		}
	}

	render() {
		const {
			loading,
			firstName,
			lastName,
			buyerName,
			buildingNumber,
			streetName,
			city,
			postalCode,
			region,
			country,
			vat,
			location,
		} = this.props;
		const {errors, inError, loadingForm} = this.state;

		if (loading) {
			return (
				<div className="account-base account-billing-address">
					<WaitForLoad loading />
				</div>
			);
		}

		const fullName = firstName + (lastName ? ` ${lastName}` : '');

		return (
			<form onSubmit={this.handleSubmit} className="account-base account-billing-address">
				<BillingAddress
					buyerName={buyerName || fullName}
					address={{
						building_number: buildingNumber,
						street_name: streetName,
						city,
						postal_code: postalCode,
						region,
						country,
					}}
					vat={vat}
					inError={inError}
				/>
				{errors && <FormError errorText={errors} />}
				{location.query.success
					&& <FormSuccess successText="You've successfully changed your billing address" />}
				<AccountValidationButton loading={loadingForm} label="Confirm address change" />
			</form>
		);
	}
}

const userAddressQuery = gql`
	query getUserProfile {
		user {
			id
			firstName
			lastName
			buyerName
			buildingNumber
			streetName
			city
			postalCode
			region
			country
			vat
		}
	}
`;

const updateAddressMutation = gql`
	mutation updateAddress(
		$id: ID!,
		$buyerName: String,
		$buildingNumber: String,
		$streetName: String,
		$city: String,
		$postalCode: String,
		$region: String,
		$country: String,
		$vat: String,
	) {
		updateUser(
			id: $id,
			buyerName: $buyerName,
			buildingNumber: $buildingNumber,
			streetName: $streetName,
			city: $city,
			postalCode: $postalCode,
			region: $region,
			country: $country,
			vat: $vat,
		) {
			id
			buyerName
			buildingNumber
			streetName
			city
			postalCode
			region
			country
			vat
		}
	}
`;

export default compose(
	graphql(userAddressQuery, {
		props: ({data}) => {
			if (data.loading) {
				return {loading: true};
			}

			return data.user;
		},
	}),
	graphql(updateAddressMutation, {
		props: ({mutate, ownProps}) => ({
			updateAddress: (values) => {
				mutate({
					variables: {
						...values,
						id: ownProps.id,
					},
				});
			},
		}),
	}),
)(AccountBillingAddress);
