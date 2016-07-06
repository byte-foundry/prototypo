import React from 'react';

import HoodieApi from '~/services/hoodie.services.js';

export default class AllowedTopBarWithPayment extends React.Component {
	render() {
		const plan = HoodieApi.instance.plan;

		const overlay = plan.indexOf('free') !== -1
			? (
				<div className="slider-demo-overlay">
					<a className="slider-demo-overlay-text" href="#/account/create">
						<span>This feature is available with the professional subscription</span>
						<div className="slider-demo-overlay-text-more">
							<div className="slider-demo-overlay-text-more-text">Upgrade to full version</div>
						</div>
					</a>
				</div>
			)
			: false;

		return (
			<div className="allowed-top-bar-with-payment is-disabled">
				{overlay}
				{this.props.children}
			</div>
		);
	}
}
