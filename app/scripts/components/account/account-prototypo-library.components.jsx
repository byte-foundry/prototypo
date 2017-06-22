import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {graphql, gql} from 'react-apollo';

import apolloClient from '../../services/graphcool.services';

import CopyPasteInput from '../shared/copy-paste-input.components.jsx';
import FilterableTable from '../shared/filterable-table.components.jsx';
import WaitForLoad from '../wait-for-load.components';
import Button from '../shared/new-button.components.jsx';

let HoodieApi;

// Temporary catch to avoid errors in Storybook, should be removed later anyway
try {
	HoodieApi = require('../../services/hoodie.services').default;
}
catch (err) {}

class AccountPrototypoLibrary extends React.PureComponent {
	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();

		const newDomains = this.props.domains;

		newDomains.push(this.url.value);
		this.props.updateDomain(newDomains);
	}

	render() {
		const {loading, domains, token} = this.props;

		const tableHeaders = [
			{
				styleClass: classnames('sortable-table-header-cell', 'sortable-table-domain'),
				label: 'Domain name',
			},
		];

		const domainContent = domains.map((domain) => {
			return (
				<tr
					key={domain}
					className={classnames('sortable-table-row')}
				>
					<td className="sortable-table-cell">
						{domain}
					</td>
				</tr>
			);
		});

		return (
			<div className="account-base account-prototypo-library">
				<h1>Prototypo library script tag</h1>
				<WaitForLoad loading={loading}>
					<CopyPasteInput content={token}/>
				</WaitForLoad>
				<h1>Authorized domains</h1>
				<WaitForLoad loading={loading}>
					<FilterableTable tableHeaders={tableHeaders}>
						<tr className="sortable-table-add-user-form">
							<td colSpan={2}>
								<input
									className="sortable-table-add-user-form-email"
									type="url"
									name="url"
									placeholder="domain.com"
									ref={(node) => {
										if (node) this.url = node;
									}}
								/>
							</td>
							<td>
								<Button size="small" onClick={this.handleSubmit}>Add authorized domain</Button>
							</td>
						</tr>
						{domainContent}
					</FilterableTable>
				</WaitForLoad>
			</div>
		);
	}
}

AccountPrototypoLibrary.propTypes = {
	domains: PropTypes.arrayOf(
		PropTypes.string,
	).isRequired,
	token: PropTypes.string,
};

AccountPrototypoLibrary.defaultProps = {
	domains: [],
};

const query = gql`
	query getAccessToken {
		user {
			id
			accessToken {
				id
				domains
				token
			}
		}
	}
`;

const addAccessToken = gql`
	mutation addAccessToken($id: ID!, $domainNames: String!) {
		updateAccessToken(id: $id, domains: $domainNames) {
			domains
			token
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
let accessTokenId;

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
					domainNames: "localhost",
				},
			}).then(async () => {
				await data.refetch();
			}).catch((e) => {
				console.log('hello');
			});
		}
		else {
			accessTokenId = data.user.accessToken.id;
		}

		return {
			domains: data.user.accessToken.domains.split(',') || [],
			token: data.user.accessToken.token,
			updateDomain: async (domainNames) => {
				await apolloClient.mutate({
					mutation: addAccessToken,
					variables: {
						id: accessTokenId,
						domainNames: domainNames.join(','),
					}
				});

				await data.refetch();
			}
		};
	},
})(AccountPrototypoLibrary);
