import React from 'react';
import SubscriptionSidebar from './subscription-sidebar.components.jsx';

export default class Subscription extends React.Component {
	render() {
		const back = this.props.location.pathname !== '/account/create'
			? <a className="account-intercom" href="#/dashboard">Go back to the app!</a>
			: false;

		return (
			<div className="account-dashboard">
				<div className="account-dashboard-icon"/>
				<div className="account-header">
					<h1 className="account-title">Subscribe to Prototypo</h1>
					{back}
				</div>
				<div className="account-dashboard-container">
					<SubscriptionSidebar />
					{this.props.children}
				</div>
			</div>
		);
	}
}
