import React from 'react';

export default class AccountSidebar extends React.Component {
	render() {
		return (
			<div className="account-sidebar">
				<div className="account-button">Go to the app</div>
				<ul className="account-sidebar-menu">
					<li className="account-sidebar-menu-item">My profile</li>
					<li className="account-sidebar-menu-item">Account settings</li>
					<li className="account-sidebar-menu-item">Billing history</li>
				</ul>
			</div>
		);
	}
}
