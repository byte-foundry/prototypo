import React from 'react';
import {gql, graphql} from 'react-apollo';
import {Route, withRouter, Redirect} from 'react-router-dom';

class ProtectedRoute extends React.Component {
	render() {
		const {loading, user, location} = this.props;

		if (loading) {
			return <p>loading du swag</p>;
		}

		if (!user) {
			const query = new URLSearchParams(location.search);

			query.set('prevHash', location.pathname);

			return (
				<Redirect
					to={{
						pathname: '/signin',
						search: query.toString(),
						state: {prevHash: location.pathname},
					}}
				/>
			);
		}

		return <Route {...this.props} />;
	}
}

const loggedInUserQuery = gql`
	query loggedInUserQuery {
		user {
			id
		}
	}
`;

export default graphql(loggedInUserQuery, {
	options: {fetchPolicy: 'network-and-cache'},
	props: ({data}) => ({
		loading: data.loading,
		user: data.user,
	}),
})(withRouter(ProtectedRoute));
