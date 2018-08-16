import React from 'react';
import {Link, withRouter} from 'react-router';
import {graphql, gql} from 'react-apollo';

import Logout from '../logout.components';
import AccountSidebar from './account-sidebar.components';
import Button from '../shared/new-button.components';

export class AccountDashboard extends React.Component {
	constructor(props) {
		super(props);

		this.returnToDashboard = this.returnToDashboard.bind(this);
	}

	returnToDashboard() {
		this.props.router.push('/library/home');
	}

	render() {
		const {firstName, location, route, children} = this.props;

		const titles = {
			home: 'My account',
			profile: 'My account',
			details: 'My account',
			create: 'Subscribe to prototypo',
			createSignup: 'Subscribe to prototypo',
			success: 'My account',
			confirm: 'My account',
			billing: 'My account',
			organization: 'My account',
			library: 'My account',
		};
		const subtitles = {
			home: `Hi ${firstName}!`,
			profile: 'My profile',
			'change-password': 'Change my password',
			details: 'My account settings',
			create: '',
			createSignup: '',
			success: 'Congratulations!',
			confirm: '',
			'prototypo-library': 'Welcome developers!',
			billing: 'My billing history',
			'billing-address': 'My billing address',
			'add-card': 'Add a card',
			'change-plan': 'Change my plan',
		};
		const title = titles[route.name];
		const subtitle
			= subtitles[
				location.pathname.split('/')[location.pathname.split('/').length - 1]
			];

		return (
			<div className="account-dashboard">
				<Link to="/library/home">
					<div className="account-dashboard-icon" />
				</Link>
				<div className="account-header">
					<h1 className="account-title">{title}</h1>
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
				{subtitle === '' ? (
					false
				) : (
					<h1 className="account-dashboard-page-title">{subtitle}</h1>
				)}
				<div className="account-dashboard-container">
					<AccountSidebar />
					{children}
				</div>
			</div>
		);
	}
}

const getFirstNameQuery = gql`
	query getFirstName {
		user {
			id
			firstName
		}
	}
`;

export default graphql(getFirstNameQuery, {
	options: {
		fetchPolicy: 'cache-first',
	},
	props: ({data}) => {
		if (data.loading) {
			return {loading: true, firstName: ''};
		}

		return data.user;
	},
})(withRouter(AccountDashboard));
