import React from 'react';
import {graphql} from 'react-apollo';
import gql from 'graphql-tag';

import HoodieApi from '../../services/hoodie.services.js';

import AccountManageSubUsers from './account-manage-sub-users.components';

const withLoader = (Component) => {
	return ({loading, ...rest}) => {
		if (loading) {
			return <p>Loading...</p>;
		}

		return <Component {...rest} />;
	};
};

const query = gql`
	query getSubUsers {
		user {
			id
			subUsers {
				id
				email
			}
			pendingSubUsers {
				id
				email
			}
		}
	}
`;

export default graphql(query, {
	options: {
		fetchPolicy: 'cache-and-network',
	},
	props: ({data}) => {
		if (data.loading) {
			return {loading: true};
		}

		const members = [
			...data.user.subUsers.map((e) => {
				return {...e, status: 'active'};
			}),
			...data.user.pendingSubUsers.map((e) => {
				return {...e, status: 'pending'};
			}),
		].sort((a, b) => a.email > b.email);

		return {
			members,
			onAddUser: async (infos) => {
				await HoodieApi.addManagedUser(data.user.id, infos);

				await data.refetch();
			},
			onRemoveUser: async ({id}) => {
				await HoodieApi.removeManagedUser(data.user.id, id);

				await data.refetch();
			},
		};
	},
})(withLoader(AccountManageSubUsers));
