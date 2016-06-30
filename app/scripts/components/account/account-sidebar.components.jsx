import React from 'react';
import classNames from 'classnames';
import {Link} from 'react-router';
import Lifespan from 'lifespan';

import LocalClient from '../../stores/local-client.stores.jsx';

export default class AccountSidebar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					infos: head.toJS().infos,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
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

		const detailsMenu = this.state.infos && this.state.infos.subscriptions
			? (
					<ul className="account-sidebar-menu-item-options">
						<li className={classAddCard}><Link to="account/details/add-card">Add a card</Link></li>
						<li className={classBillingAddress}><Link to="account/details/billing-address">My billing address</Link></li>
						<li className={classChangePlan}><Link to="account/details/change-plan">Change plan</Link></li>
					</ul>
			)
			: (
					<ul className="account-sidebar-menu-item-options">
						<li className={classChangePlan}><Link to="account/create/choose-a-plan">Subscribe to the pro plan</Link></li>
					</ul>
			);

		return (
			<div className="account-sidebar">
				<Link className="account-button" to="/dashboard">Go to the app</Link>
				<ul className="account-sidebar-menu">
					<li className={classProfile}><Link to="/account/profile">My profile</Link>
						<ul className="account-sidebar-menu-item-options">
							<li className={classChangePassword}><Link to="/account/profile/change-password">change password</Link></li>
						</ul>
					</li>
					<li className={classDetails}><Link to="/account/details">Account settings</Link>
						{detailsMenu}
					</li>
					<li className="account-sidebar-menu-item account-sidebar-menu-billing"><Link to="account/billing">Billing history</Link></li>
				</ul>
			</div>
		);
	}
}

AccountSidebar.contextTypes = {
	router: React.PropTypes.object.isRequired,
};
