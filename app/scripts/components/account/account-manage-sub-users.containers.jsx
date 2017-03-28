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
		forceFetch: true,
	},
	props: ({data}) => {
		if (data.loading) {
			return {loading: true};
		}

		const allSubUsers = [
			...data.user.subUsers.map((e) => {
				return {...e, status: 'active'};
			}),
			...data.user.pendingSubUsers.map((e) => {
				return {...e, status: 'pending'};
			}),
		];

		return {
			members: allSubUsers.sort((a, b) => {
				return a.email > b.email;
			}),
			onAddUser: async (infos) => {
				await HoodieApi.addManagedUser(data.user.id, infos);

				data.refetch();
			},
			onRemoveUser: async ({id}) => {
				await HoodieApi.removeManagedUser(data.user.id, id);

				data.refetch();
			},
		};
	},
})(withLoader(AccountManageSubUsers));
