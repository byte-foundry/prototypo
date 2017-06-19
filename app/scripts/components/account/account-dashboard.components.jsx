import React from 'react';
import {Link} from 'react-router';
import AccountSidebar from './account-sidebar.components.jsx';

export default class AccountDashboard extends React.Component {
	render() {
		const titles = {
			home: "My account",
			profile: "My account",
			details: "My account",
			create: "Subscribe to prototypo",
			createSignup: "Subscribe to prototypo",
			signup: "Sign up",
			signin: "Sign in",
			success: "My account",
			confirm: "My account",
			billing: "My account",
			organization: "My account",
		};
		const title = titles[this.props.route.name];

		return (
			<div className="account-dashboard">
				<div className="account-dashboard-icon"/>
				<Link to="/dashboard" className="account-dashboard-back-icon"/>
				<div className="account-header">
					<h1 className="account-title">{title}</h1>
				</div>
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
};
