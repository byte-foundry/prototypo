import React from 'react';
import SubscriptionSidebar from './subscription-sidebar.components.jsx';

export default class Subscription extends React.Component {
	render() {
		return (
			<div className="account-dashboard">
				<div className="account-dashboard-icon"/>
				<h1 className="account-title">Subscribe to Prototypo</h1>
				<div className="account-dashboard-container">
					<SubscriptionSidebar />
					{this.props.children}
				</div>
			</div>
		);
	}
}
