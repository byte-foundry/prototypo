import React from 'react';
import AccountSidebar from './account-sidebar.components.jsx';

export default class AccountDashboard extends React.Component {
	render() {
		return (
			<div className="account-dashboard">
				<div className="account-dashboard-icon"/>
				<h1 className="account-title">the title</h1>
				<div className="account-dashboard-container">
					<AccountSidebar />
					{this.props.children}
				</div>
			</div>
		);
	}
}
