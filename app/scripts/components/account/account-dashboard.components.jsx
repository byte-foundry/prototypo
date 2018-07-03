import PropTypes from 'prop-types';
import React from 'react';
import {Link, withRouter} from 'react-router-dom';

import Logout from '../logout.components';
import AccountSidebar from './account-sidebar.components';
import Button from '../shared/new-button.components';

export class AccountDashboard extends React.Component {
	constructor(props) {
		super(props);

		this.returnToDashboard = this.returnToDashboard.bind(this);
	}

	returnToDashboard() {
		this.props.history.push('/library');
	}

	render() {
		const {title, children} = this.props;

		return (
			<div className="account-dashboard">
				<Link to="/library">
					<div className="account-dashboard-icon" />
				</Link>
				<div className="account-header">
					<h1 className="account-title">My account</h1>
					<div className="account-header-right">
						<Logout
							render={props => (
								<Button
									className="account-dashboard-logout-button"
									size="small"
									outline
									onClick={props.logout}
								>
									Logout
								</Button>
							)}
						/>
						<button
							className="account-dashboard-back-icon"
							onClick={this.returnToDashboard}
						/>
					</div>
				</div>
				{title && <h1 className="account-dashboard-page-title">{title}</h1>}
				<div className="account-dashboard-container">
					<AccountSidebar />
					{children}
				</div>
			</div>
		);
	}
}

AccountDashboard.propTypes = {
	title: PropTypes.string,
};

export default withRouter(AccountDashboard);
