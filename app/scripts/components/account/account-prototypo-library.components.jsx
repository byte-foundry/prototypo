import React from 'react';
import classnames from 'classnames';
import {graphql, gql} from 'react-apollo';

import apolloClient from '../../services/graphcool.services';

import CopyPasteInput from '../shared/copy-paste-input.components.jsx';
import FilterableTable from '../shared/filterable-table.components.jsx';
import Button from '../shared/new-button.components.jsx';

let HoodieApi;

// Temporary catch to avoid errors in Storybook, should be removed later anyway
try {
	HoodieApi = require('../../services/hoodie.services').default;
}
catch (err) {}

class AccountPrototypoLibrary extends React.PureComponent {
	constructor(props) {
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit() {
	}

	render() {
		const tableHeaders = [
			{
				styleClass: classnames('sortable-table-header-cell', 'sortable-table-domain'),
				label: 'Domain name',
			},
		];

		return (
			<div className="account-base account-prototypo-library">
				<h1>Prototypo library script tag</h1>
				<CopyPasteInput content={this.props.token}/>
				<h1>Authorized domains</h1>
				<FilterableTable tableHeaders={tableHeaders}>
					<tr className="sortable-table-add-user-form">
						<td />
						<td colSpan={2}>
							<input
								className="sortable-table-add-user-form-email"
								type="url"
								name="url"
								placeholder="domain.com"
								ref={(node) => {
									if (node) this.email = node;
								}}
							/>
						</td>
						<td>
							<Button size="small" onClick={this.handleSubmit}>Add authorized domain</Button>
						</td>
					</tr>
				</FilterableTable>
			</div>
		);
	}
}

const query = gql`
	query getSubUsers {
		user {
			id
			accessToken {
				domains
				token
			}
		}
	}
`;

const addAccessToken = gql`
	mutation addAccessToken($id: ID!, $domainNames: String!) {
		updateUser(id: $id, accessToken: {
			domains: $domainNames
		}) {
			id
			accessToken {
				domains
				token
			}
		}
	}
`;

const createAccessToken = gql`
	mutation createTokenForUser($id: ID!, $domainNames: String!) {
		createAccessToken(
			userId: $id
			domains: $domainNames
		) {
			domains
			token
		}
	}
`;

let userId;

export default graphql(query, {
	options: {
		fetchPolicy: 'cache-and-network',
	},
	props: ({data}) => {
		// TMP: don't fail if there's no graphcool account
		if (data.loading) {
			return {loading: true};
		}

		if (!data.user) {
			return {
				noUser: true,
				createUser: async (user, password) => {
					await Hoodie.createGraphCoolUser(user, password);

					await data.refetch();
				}
			}
		}

		userId = data.user.id;

		if (!data.user.accessToken) {
			return apolloClient.mutate({
				mutation: createAccessToken,
				variables: {
					id: userId,
					domainNames: "",
				}
			}).then(async () => {
				await data.refetch();
			}).catch((e) => {
				console.log('hello');
			});
		}

		return {
			domains: data.user.accessToken.domains.split(','),
			token: data.user.accessToken.token,
			updateDomain: async (domainNames) => {
				await apolloClient.mutate({
					mutation: addAccessToken,
					variables: {
						id: userId,
						domainNames: domainNames.join(','),
					}
				});

				await data.refetch();
			}
		};
	},
})(AccountPrototypoLibrary);
