import React from 'react';
import {withRouter} from 'react-router';
import {graphql, gql} from 'react-apollo';

import AccountPage from './account-page.components';
import AccountSidebar from './account-sidebar.components';

export class AccountDashboard extends React.Component {
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
			organization: 'Organization',
		};
		const title = titles[route.name];
		const subtitle
			= subtitles[location.pathname.split('/')[location.pathname.split('/').length - 1]];

		return (
			<AccountPage title={title} subtitle={subtitle}>
				<div className="account-dashboard-container">
					<AccountSidebar />
					{children}
				</div>
			</AccountPage>
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
