import React from 'react';
import Classnames from 'classnames';
import {Link} from 'react-router';

export default class AccountSidebar extends React.Component {
	render() {
		const classProfile = Classnames({
			"is-active": this.context.router.isActive('account/profile'),
			"account-sidebar-menu-item": true,
			"account-sidebar-menu-profile": true,
		});
		const classDetails = Classnames({
			"is-active": this.context.router.isActive('account/details'),
			"account-sidebar-menu-item": true,
			"account-sidebar-menu-account": true,
		});
		const classChangePassword = Classnames({
			"account-sidebar-menu-item-options-item": true,
			"is-active": this.context.router.isActive('account/profile/change-password'),
		});
		const classBillingAddress = Classnames({
			"account-sidebar-menu-item-options-item": true,
			"is-active": this.context.router.isActive('account/details/billing-address'),
		});
		const classAddCard = Classnames({
			"account-sidebar-menu-item-options-item": true,
			"is-active": this.context.router.isActive('account/details/add-card'),
		});
		const classChangePlan = Classnames({
			"account-sidebar-menu-item-options-item": true,
			"is-active": this.context.router.isActive('account/details/change-plan'),
		});

		return (
			<div className="account-sidebar">
				<div className="account-button">Go to the app</div>
				<ul className="account-sidebar-menu">
					<li className={classProfile}><Link to="/account/profile">My profile</Link>
						<ul className="account-sidebar-menu-item-options">
							<li className={classChangePassword}><Link to="/account/profile/change-password">change password</Link></li>
						</ul>
					</li>
					<li className={classDetails}><Link to="/account/details">Account settings</Link>
						<ul className="account-sidebar-menu-item-options">
							<li className={classAddCard}><Link to="account/details/add-card">Add a card</Link></li>
							<li className={classBillingAddress}><Link to="account/details/billing-address">My billing address</Link></li>
							<li className={classChangePlan}><Link to="account/details/change-plan">Change plan</Link></li>
						</ul>
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
