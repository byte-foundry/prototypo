import React from 'react';

import InputWithLabel from './input-with-label.components.jsx';

export default class BillingAddress extends React.Component {
	getBuyerName() {
		return this.refs.buyerName.inputValue;
	}

	getAddress() {
		return {
			building_number: this.refs.buildingNumber.inputValue,
			street_name: this.refs.streetName.inputValue,
			address_detail: this.refs.addressDetails.inputValue,
			city: this.refs.city.inputValue,
			postal_code: this.refs.postalCode.inputValue,
			region: this.refs.region.inputValue,
			country: this.refs.country.inputValue,
		}
	}

	render() {
		return (
			<div className="billing-address">
				<InputWithLabel required={true} ref="buyerName" inputValue={this.props.buyerName} error={this.props.inError.buyerName} label="Corporate name or Full name" />
				<div className="columns">
					<div className="third-column">
						<InputWithLabel ref="buildingNumber" inputValue={this.props.address.building_number} error={this.props.inError.buildingNumber} required={true} label="Bldg #" />
					</div>
					<div className="two-third-column">
						<InputWithLabel ref="streetName" inputValue={this.props.address.street_name} error={this.props.inError.streetName} required={true} label="Street name" />
					</div>
				</div>
				<InputWithLabel inputValue={this.props.address.address_detail} ref="addressDetails" label="Address details" />
				<div className="columns">
					<div className="half-column">
						<InputWithLabel ref="city" inputValue={this.props.address.city} error={this.props.inError.city} required={true} label="City" />
					</div>
					<div className="half-column">
						<InputWithLabel ref="postalCode" inputValue={this.props.address.postal_code} error={this.props.inError.postalCode} required={true} label="Postal code" />
					</div>
				</div>
				<div className="columns">
					<div className="half-column">
						<InputWithLabel ref="region" inputValue={this.props.address.region} label="Region" />
					</div>
					<div className="half-column">
						<InputWithLabel ref="country" inputValue={this.props.address.country} error={this.props.inError.country} required={true} label="Country" />
					</div>
				</div>
			</div>
		)
	}
}
