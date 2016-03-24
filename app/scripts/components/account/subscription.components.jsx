import React from 'react';
import SubscriptionSidebar from './subscription-sidebar.components.jsx';

export default class Subscription extends React.Component {
	render() {
		const intercom = this.props.location.pathname !== '/account/create'
			? <a className="account-intercom" id="intercom-button" href="mnph1bst@incoming.intercom.io">Do you need any help ?<br/><span>Click here and we'll come to your rescue!</span></a>
			: false;

		return (
			<div className="account-dashboard">
				<div className="account-dashboard-icon"/>
				<div className="account-header">
					<h1 className="account-title">Subscribe to Prototypo</h1>
					{intercom}
				</div>
				<div className="account-dashboard-container">
					<SubscriptionSidebar />
					{this.props.children}
				</div>
			</div>
		);
	}
}
