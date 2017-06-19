import React, {PropTypes} from 'react';
import {Link} from 'react-router';
import Lifespan from 'lifespan';

import SubscriptionSidebar from './subscription-sidebar.components.jsx';
import SubscriptionCardAndValidation from './subscription-card-and-validation.components.jsx';
import LocalClient from '../../stores/local-client.stores.jsx';
import withCountry from '../shared/with-country.components';

class Subscription extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
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

	componentDidUpdate() {
		if (this.props.location.query.plan) {
			this.client.dispatchAction('/choose-plan', {
				plan: this.props.location.query.plan,
			});
		}
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		const {country, location} = this.props;
		const back = location.pathname === '/account/subscribe'
			? false
			: <a className="account-back-app" href="#/dashboard">BACK TO THE APP</a>;

		return (
			<div className="subscription">
				<Link to="/dashboard" className="account-dashboard-icon is-in-subscription"/>
				{back}
				<div className="account-dashboard-container">
					<SubscriptionSidebar
						plan={location.query.plan}
						country={country}
					/>
					<SubscriptionCardAndValidation
						plan={this.props.location.query.plan}
						quantity={this.props.location.query.quantity}
						coupon={this.props.location.query.coupon}
						country={country}
					/>
				</div>
			</div>
		);
	}
}

Subscription.propTypes = {
	location: PropTypes.object.isRequired,
	country: PropTypes.string.isRequired,
};

export default withCountry(Subscription);
