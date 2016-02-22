import React from 'react';

export default class AccountSidebar extends React.Component {
	render() {
		return (
			<div className="account-sidebar">
				<div className="account-button">Go to the app</div>
				<ul className="account-sidebar-menu">
					<li className="account-sidebar-menu-item account-sidebar-menu-profile">My profile
						<ul className="account-sidebar-menu-item-options">
							<li className="account-sidebar-menu-item-options-item">Change password</li>
						</ul>
					</li>
					<li className="account-sidebar-menu-item account-sidebar-menu-account">Account settings
						<ul className="account-sidebar-menu-item-options">
							<li className="account-sidebar-menu-item-options-item">Add a card</li>
							<li className="account-sidebar-menu-item-options-item">My billing address</li>
						</ul>
					</li>
					<li className="account-sidebar-menu-item account-sidebar-menu-billing">Billing history</li>
				</ul>
			</div>
		);
	}
}
