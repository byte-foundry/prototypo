import React from 'react';

export default class SubscriptionSidebar extends React.Component {
	render() {
		return (
			<div className="subscription-sidebar">
				<ul className="subscription-sidebar-steps">
					<li className="subscription-sidebar-steps-step is-active">
						<div className="subscription-sidebar-steps-step-number">1</div>
						<div className="subscription-sidebar-steps-step-label">Sign up</div>
					</li>
					<li className="subscription-sidebar-steps-step">
						<div className="subscription-sidebar-steps-step-number">2</div>
						<div className="subscription-sidebar-steps-step-label">Choose a plan</div>
					</li>
					<li className="subscription-sidebar-steps-step">
						<div className="subscription-sidebar-steps-step-number">3</div>
						<div className="subscription-sidebar-steps-step-label">Add a card</div>
					</li>
					<li className="subscription-sidebar-steps-step">
						<div className="subscription-sidebar-steps-step-number">4</div>
						<div className="subscription-sidebar-steps-step-label">Billing address</div>
					</li>
					<li className="subscription-sidebar-steps-step">
						<div className="subscription-sidebar-steps-step-number">5</div>
						<div className="subscription-sidebar-steps-step-label">Confirmation</div>
					</li>
				</ul>
			</div>
		);
	}
}
