import React from 'react';
import classNames from 'classnames';
import {Link} from 'react-router';
import Lifespan from 'lifespan';
import HoodieApi from '~/services/hoodie.services.js';

import LocalClient from '../../stores/local-client.stores.jsx';

export default class AccountSidebar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const isPayingCustomer = HoodieApi.instance && HoodieApi.instance.plan.indexOf('free_') === -1;
		const classHome = classNames({
			"is-active": this.context.router.isActive('account/home'),
			"account-sidebar-menu-item": true,
			"account-sidebar-menu-home": true,
		});
		const classProfile = classNames({
			"is-active": this.context.router.isActive('account/profile'),
			"account-sidebar-menu-item": true,
			"account-sidebar-menu-profile": true,
		});
		const classDetails = classNames({
			"is-active": this.context.router.isActive('account/details'),
			"account-sidebar-menu-item": true,
			"account-sidebar-menu-account": true,
		});
		const classChangePassword = classNames({
			"account-sidebar-menu-item-options-item": true,
			"is-active": this.context.router.isActive('account/profile/change-password'),
		});
		const classBilling = classNames({
			"is-active": this.context.router.isActive('account/billing'),
			"account-sidebar-menu-item": true,
			"account-sidebar-menu-billing": true,
		});
		const classBillingAddress = classNames({
			"account-sidebar-menu-item-options-item": true,
			"is-active": this.context.router.isActive('account/details/billing-address'),
		});
		const classAddCard = classNames({
			"account-sidebar-menu-item-options-item": true,
			"is-active": this.context.router.isActive('account/details/add-card'),
		});
		const classChangePlan = classNames({
			"account-sidebar-menu-item-options-item": true,
			"is-active": this.context.router.isActive('account/details/change-plan'),
		});

		const detailsMenu = isPayingCustomer
			? (
					<ul className="account-sidebar-menu-item-options">
						<Link to="account/details/add-card"><li className={classAddCard}>Add a card</li></Link>
						<Link to="account/details/billing-address"><li className={classBillingAddress}>My billing address</li></Link>
						<Link to="account/details/change-plan"><li className={classChangePlan}>Change plan</li></Link>
					</ul>
			)
			: (
					<ul className="account-sidebar-menu-item-options">
						<Link to="account/subscribe"><li className={classChangePlan}>Subscribe to the pro plan</li></Link>
					</ul>
			);

		return (
			<div className="account-sidebar">
				<ul className="account-sidebar-menu">
					<Link to="/account/home"><li className={classHome}>Home</li></Link>
					<Link to="/account/profile"><li className={classProfile}>My profile
						<ul className="account-sidebar-menu-item-options">
							<Link to="/account/profile/change-password"><li className={classChangePassword}>Change password</li></Link>
						</ul>
					</li></Link>
					<Link to="/account/details"><li className={classDetails}>Account settings
						{detailsMenu}
					</li></Link>
					<Link to="/account/billing"><li className={classBilling}>Billing history</li></Link>
				</ul>
			</div>
		);
	}
}

AccountSidebar.contextTypes = {
	router: React.PropTypes.object.isRequired,
};
