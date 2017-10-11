import React from 'react';
import {countries} from 'country-data';

import InputWithLabel from './input-with-label.components';
import SelectWithLabel from './select-with-label.components';

const countryOptions = countries.all.map(({name, alpha2}) => ({value: alpha2, label: name}));

export default class BillingAddress extends React.PureComponent {
	render() {
		const {buyerName, address, vat, inError} = this.props;

		return (
			<div className="billing-address">
				<InputWithLabel
					required
					name="buyer_name"
					autoComplete="name"
					inputValue={buyerName}
					error={inError.buyerName}
					label="Corporate name or Full name"
				/>
				<div className="columns">
					<div className="third-column">
						<InputWithLabel
							name="building_number"
							inputValue={address.building_number}
							error={inError.buildingNumber}
							required
							label="Building number"
						/>
					</div>
					<div className="two-third-column">
						<InputWithLabel
							name="street_name"
							inputValue={address.street_name}
							error={inError.streetName}
							required
							label="Street name"
						/>
					</div>
				</div>
				<div className="columns">
					<div className="half-column">
						<InputWithLabel
							name="city"
							inputValue={address.city}
							error={inError.city}
							required
							label="City"
						/>
					</div>
					<div className="half-column">
						<InputWithLabel
							name="postal_code"
							inputValue={address.postal_code}
							error={inError.postalCode}
							required
							label="Postal code"
						/>
					</div>
				</div>
				<div className="columns">
					<div className="half-column">
						<InputWithLabel name="region" inputValue={address.region} label="Region" />
					</div>
					<div className="half-column">
						<SelectWithLabel
							name="country"
							inputValue={address.country}
							options={countryOptions}
							error={inError.country}
							required
							label="Country"
						/>
					</div>
				</div>
				<div className="columns">
					<div className="full-column">
						<InputWithLabel
							name="vat"
							label="VAT number"
							inputValue={vat}
							info="(only necessary if you pay with a company card)"
						/>
					</div>
				</div>
			</div>
		);
	}
}
