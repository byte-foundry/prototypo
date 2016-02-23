import React from 'react';

import InputWithLabel from './input-with-label.components.jsx';

export default class BillingAddress extends React.Component {
	render() {
		return (
			<div className="billing-address">
				<InputWithLabel required={true} label="Corporate name or Full name" />
				<div className="columns">
					<div className="third-column">
						<InputWithLabel required={true} label="Bldg #" />
					</div>
					<div className="two-third-column">
						<InputWithLabel required={true} label="Street name" />
					</div>
				</div>
				<InputWithLabel required={true} label="Address details" />
				<div className="columns">
					<div className="half-column">
						<InputWithLabel required={true} label="City" />
					</div>
					<div className="half-column">
						<InputWithLabel required={true} label="Postal code" />
					</div>
				</div>
				<div className="columns">
					<div className="half-column">
						<InputWithLabel required={true} label="Region" />
					</div>
					<div className="half-column">
						<InputWithLabel required={true} label="Country" />
					</div>
				</div>
			</div>
		)
	}
}
