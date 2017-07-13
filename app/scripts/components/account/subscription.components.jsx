import React, {PropTypes} from 'react';
import {Link, withRouter} from 'react-router';
import Lifespan from 'lifespan';

import SubscriptionSidebar from './subscription-sidebar.components.jsx';
import SubscriptionCardAndValidation from './subscription-card-and-validation.components.jsx';
import LocalClient from '../../stores/local-client.stores.jsx';
import withCountry from '../shared/with-country.components';

class Subscription extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};

		this.handleChangePlan = this.handleChangePlan.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client
			.getStore('/userStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					hasBeenSubscribing: head.toJS().d.hasBeenSubscribing,
				});
			})
			.onDelete(() => {
				this.setState({hasBeenSubscribing: false});
			});

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

	handleChangePlan({plan, quantity, coupon}) {
		const {router, location} = this.props;
		const query = {...location.query};

		if (plan) query.plan = plan;
		if (quantity) query.quantity = (quantity && quantity.toString()) || undefined;
		if (coupon) query.coupon = coupon || undefined;

		router.replace({
			...location,
			query,
		});
	}

	render() {
		const {hasBeenSubscribing} = this.state;
		const {country, location} = this.props;
		const {plan, quantity, coupon} = location.query;

		if (!plan) {
			this.props.router.replace({...this.props.location, query: {plan: 'personal_annual_99'}});
			return null;
		}

		return (
			<div className="subscription">
				<Link to="/dashboard" className="account-dashboard-icon is-in-subscription" />
				<div className="account-dashboard-container">
					<SubscriptionSidebar
						plan={plan}
						quantity={parseInt(quantity, 10)}
						country={country}
						onChangePlan={this.handleChangePlan}
						hasBeenSubscribing={hasBeenSubscribing}
					/>
					<SubscriptionCardAndValidation
						plan={plan}
						quantity={parseInt(quantity, 10)}
						coupon={coupon}
						country={country}
						onChangePlan={this.handleChangePlan}
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

export default withRouter(withCountry(Subscription));
