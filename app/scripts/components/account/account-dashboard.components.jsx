import React from 'react';
import AccountSidebar from './account-sidebar.components.jsx';

export default class AccountDashboard extends React.Component {
	render() {
		const titles = {
			profile: "My account",
			details: "My account",
			create: "Subscribe to prototypo",
		};
		const title = titles[this.props.route.path];

		return (
			<div className="account-dashboard">
				<div className="account-dashboard-icon"/>
				<h1 className="account-title">{title}</h1>
				<div className="account-dashboard-container">
					<AccountSidebar />
					{this.props.children}
				</div>
			</div>
		);
	}
}

AccountDashboard.contextTypes = {
	router: React.PropTypes.object.isRequired,
}
