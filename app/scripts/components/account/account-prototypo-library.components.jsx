import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Lifespan from 'lifespan';
import {Link} from 'react-router';
import {graphql, gql} from 'react-apollo';

import apolloClient from '../../services/graphcool.services';
import LocalClient from '../../stores/local-client.stores.jsx';

import CopyPasteInput from '../shared/copy-paste-input.components';
import FilterableTable from '../shared/filterable-table.components';
import WaitForLoad from '../wait-for-load.components';
import Button from '../shared/new-button.components';

class AccountPrototypoLibrary extends React.PureComponent {
	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.state = {};
	}

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();

		this.client
			.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				const {credits} = head.toJS().d;

				this.setState({
					credits,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client
			.getStore('/userStore', this.lifespan)
			.onUpdate((head) => {
				const {subscription} = head.toJS().d;

				this.setState({
					subscription,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	handleSubmit(e) {
		e.preventDefault();

		const newDomains = this.props.domains;

		newDomains.push(this.url.value);
		this.props.updateDomain(newDomains);
	}

	render() {
		const {subscription, credits} = this.state;
		const freeAccount
			= !this.props.isManagedAccount
			&& !(
				subscription
				&& !subscription.plan.id.includes('team')
				&& !subscription.plan.id.includes('agency')
			);
		const freeAccountAndHasCredits = credits && credits > 0 && freeAccount;
		const {loading, domains, token} = this.props;

		const tableHeaders = [
			{
				styleClass: classnames(
					'sortable-table-header-cell',
					'sortable-table-domain',
				),
				label: 'Domain name',
			},
		];

		const domainContent = domains.map(domain => (
			<tr key={domain} className={classnames('sortable-table-row')}>
				<td className="sortable-table-cell">{domain}</td>
			</tr>
		));

		const payingContent = (
			<div>
				<h1>Prototypo library token</h1>
				<WaitForLoad loading={loading}>
					<CopyPasteInput content={token} />
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
								<Button size="small" onClick={this.handleSubmit}>
									Add authorized domain
								</Button>
							</td>
						</tr>
						{domainContent}
					</FilterableTable>
				</WaitForLoad>
			</div>
		);

		const freeContent = (
			<div>
				<h3 className="account-dashboard-container-small-title">
					You do not have a plan for the moment. To take full advantage of the
					library you'll need to subscribe to Prototypo.
				</h3>
				<p>
					<img style={{width: '100%'}} src="assets/images/go-pro.gif" />
				</p>
				<p>
					Subscribe to our{' '}
					<Link className="account-link" to="account/subscribe">
						pro plan
					</Link>{' '}
					to benefit of the full power of Prototypo's library without
					restrictions!
				</p>
			</div>
		);

		return (
			<div className="account-base account-prototypo-library">
				<h1>Documentation</h1>
				<div>
					Check out the{' '}
					<a
						href="https://doc.prototypo.io"
						target="_blank"
						rel="noopener noreferrer"
					>
						documentation
					</a>{' '}
					to learn how to use the prototypo library.<br />To use the library you
					will need the token under here and you'll also need to add the domain
					name where you'll want to use the library.
				</div>
				{freeAccountAndHasCredits || !freeAccount ? payingContent : freeContent}
			</div>
		);
	}
}

AccountPrototypoLibrary.propTypes = {
	domains: PropTypes.arrayOf(PropTypes.string).isRequired,
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
		createAccessToken(userId: $id, domains: $domainNames) {
			domains
			token
		}
	}
`;

let userId;
let accessTokenId;
let isManagedAccount;

export default graphql(query, {
	options: {
		fetchPolicy: 'cache-and-network',
	},
	props: ({data}) => {
		// TMP: don't fail if there's no graphcool account
		if (data.loading) {
			return {loading: true};
		}

		userId = data.user.id;
		isManagedAccount = data.user && data.user.manager;

		if (data.user.accessToken) {
			accessTokenId = data.user.accessToken.id;
		}
		else {
			return apolloClient
				.mutate({
					mutation: createAccessToken,
					variables: {
						id: userId,
						domainNames: 'localhost',
					},
				})
				.then(async () => {
					await data.refetch();
				})
				.catch((e) => {
					console.log(e);
				});
		}

		return {
			domains: data.user.accessToken.domains.split(',') || [],
			isManagedAccount,
			token: data.user.accessToken.token,
			updateDomain: async (domainNames) => {
				await apolloClient.mutate({
					mutation: addAccessToken,
					variables: {
						id: accessTokenId,
						domainNames: domainNames.join(','),
					},
				});

				await data.refetch();
			},
		};
	},
})(AccountPrototypoLibrary);
