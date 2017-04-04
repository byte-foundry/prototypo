import React from 'react';
import {Link} from 'react-router';
import AccountSidebar from './account-sidebar.components.jsx';

export default class AccountDashboard extends React.Component {
	render() {
		console.log(this.props);
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
		};
		const subtitles = {
			home: "My account",
			profile: "My profile",
			'change-password': "Change my password",
			details: "My account settings",
			create: "",
			createSignup: "",
			signup: "",
			signin: "",
			success: "",
			confirm: "",
			billing: "My billing history",
			'add-card': "Add a card",
		};
		const title = titles[this.props.route.name];
		const subtitle = subtitles[this.props.location.pathname.split('/')[this.props.location.pathname.split('/').length - 1]];

		return (
			<div className="account-dashboard">
				<Link to="/dashboard">
					<div className="account-dashboard-icon"/>
				</Link>
				<div className="account-header">
					<h1 className="account-title">{title}</h1>
				</div>
				{
					subtitle === ""
					? false
					: (<h1 className="account-dashboard-page-title">{subtitle}</h1>)
				}
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
