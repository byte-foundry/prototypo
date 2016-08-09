import React from 'react';
import SubscriptionSidebar from './subscription-sidebar.components.jsx';
import LocalClient from '../../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';

export default class Subscription extends React.Component {
	constructor(props) {
		super(props);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		if (this.props.location.query.plan) {
			this.client.dispatchAction('/choose-plan', {
				plan: this.props.location.query.plan,
			});
		}

		// a "?fromWebsite=true" parameter must be added to the link
		// on the pricing section of prototypo.io website to track the user
		if (this.props.location.query.fromWebsite) {
			this.client.dispatchAction('/store-value', {
				newUserFromWebSite: String(this.props.location.query.fromWebsite),
			});
		}
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		const back = this.props.location.pathname !== '/account/create'
			? <a className="account-back-app" href="#/dashboard">BACK TO THE APP</a>
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
