import React from 'react';

import InputWithLabel from './input-with-label.components.jsx';

export default class BillingAddress extends React.Component {
	render() {
		return (
			<div className="billing-address">
				<InputWithLabel required={true} label="Corporate name or Full name" />
				<InputWithLabel required={true} label="Bldg #" />
				<InputWithLabel required={true} label="Street name" />
				<InputWithLabel required={true} label="Address details" />
				<InputWithLabel required={true} label="City" />
				<InputWithLabel required={true} label="Postal code" />
				<InputWithLabel required={true} label="Region" />
				<InputWithLabel required={true} label="69004" />
			</div>
		);
	}
}
