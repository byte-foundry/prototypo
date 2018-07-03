import React from 'react';
import PropTypes from 'prop-types';
import {Redirect, Link, withRouter} from 'react-router-dom';
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
					validCoupon: head.toJS().d.choosePlanForm.validCoupon,
				});
			})
			.onDelete(() => {
				this.setState({hasBeenSubscribing: false});
			});

		// a "?fromWebsite=true" parameter must be added to the link
		// on the pricing section of prototypo.io website to track the user
		const query = new URLSearchParams(this.props.location.search);

		if (query.has('fromWebsite')) {
			this.client.dispatchAction('/store-value', {
				newUserFromWebSite: query.get('fromWebsite'),
			});
		}
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	handleChangePlan({plan, quantity, coupon}) {
		const {history, location} = this.props;
		const query = new URLSearchParams(location.search);

		if (plan) query.set('plan', plan);
		if (quantity) query.set('quantity', quantity || undefined);
		if (coupon) query.set('coupon', coupon);
		else query.delete('coupon');

		history.replace({
			...location,
			search: query.toString(),
		});
	}

	render() {
		const {hasBeenSubscribing} = this.state;
		const {country, location} = this.props;

		const query = new URLSearchParams(location.search);

		if (!query.has('plan')) {
			query.set('plan', 'personal_annual_99');

			return (
				<Redirect
					replace
					to={{
						...this.props.location,
						search: query.toString(),
					}}
				/>
			);
		}
		let percentPrice = 1;

		if (this.state.validCoupon && this.state.validCoupon.percent_off) {
			percentPrice = (100 - this.state.validCoupon.percent_off) / 100;
		}

		return (
			<div className="subscription">
				<Link
					to="/dashboard"
					className="account-dashboard-icon is-in-subscription"
				/>
				<div className="account-dashboard-container">
					<SubscriptionSidebar
						plan={query.get('plan')}
						quantity={parseInt(query.get('quantity'), 10)}
						country={query.get('coupon')}
						onChangePlan={this.handleChangePlan}
						hasBeenSubscribing={hasBeenSubscribing}
						percentPrice={percentPrice}
					/>
					<SubscriptionCardAndValidation
						plan={query.get('plan')}
						quantity={parseInt(query.get('quantity'), 10)}
						coupon={query.get('coupon')}
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
