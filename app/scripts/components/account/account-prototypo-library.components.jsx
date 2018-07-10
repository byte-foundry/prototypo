import gql from 'graphql-tag';
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Lifespan from 'lifespan';
import {Link} from 'react-router-dom';
import {graphql} from 'react-apollo';

import LocalClient from '../../stores/local-client.stores';

import Dashboard from './account-dashboard.components';
import CopyPasteInput from '../shared/copy-paste-input.components';
import FilterableTable from '../shared/filterable-table.components';
import WaitForLoad from '../wait-for-load.components';
import Button from '../shared/new-button.components';
import IconButton from '../shared/icon-button.components';

class AccountPrototypoLibrary extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			loadingUpdate: false,
		};

		this.handleSubmit = this.handleSubmit.bind(this);
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
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.user && !nextProps.user.accessToken) {
			// there's no access token yet
			this.props.createAccessToken();
		}
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	async handleSubmit(e) {
		e.preventDefault();

		const newDomains = [...this.props.domains, this.url.value];

		this.setState({loadingUpdate: true});

		await this.props.updateDomains(newDomains);

		this.setState({loadingUpdate: false});
	}

	removeDomain = async (domain) => {
		this.setState({loadingUpdate: true});

		await this.props.updateDomains(
			this.props.domains.filter(d => d !== domain),
		);

		this.setState({loadingUpdate: false});
	};

	render() {
		const {loading, user, domains, token, subscription} = this.props;
		const {credits, loadingUpdate} = this.state;

		const freeAccount
			= !this.props.isManagedAccount
			&& !(
				subscription
				&& !subscription.plan.id.includes('team')
				&& !subscription.plan.id.includes('agency')
			);
		const freeAccountAndHasCredits = credits && credits > 0 && freeAccount;

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
				<td className="sortable-table-cell">
					<IconButton
						style={{verticalAlign: 'middle', display: 'inline'}}
						name="delete"
						onClick={() => this.removeDomain(domain)}
					/>
					{domain}
				</td>
			</tr>
		));

		const payingContent = (
			<div>
				<h1>Prototypo library token</h1>
				<WaitForLoad loading={loading}>
					<CopyPasteInput content={token} />
				</WaitForLoad>
				<h1>Authorized domains</h1>
				<WaitForLoad loading={loading || loadingUpdate}>
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
					<Link className="account-link" to="subscribe">
						pro plan
					</Link>{' '}
					to benefit of the full power of Prototypo's library without
					restrictions!
				</p>
			</div>
		);

		return (
			<Dashboard title="Welcome developers!">
				<div className="account-base account-prototypo-library">
					<h1>Documentation</h1>
					<div>
						Check out the{' '}
						<a
							className="account-link"
							href="https://doc.prototypo.io"
							target="_blank"
							rel="noopener noreferrer"
						>
							documentation
						</a>{' '}
						to learn how to use the prototypo library.<br />To use the library
						you will need the token under here and you'll also need to add the
						domain name where you'll want to use the library.
					</div>
					<WaitForLoad loading={(!user || !user.accessToken) && loading}>
						{freeAccountAndHasCredits || !freeAccount
							? payingContent
							: freeContent}
					</WaitForLoad>
				</div>
			</Dashboard>
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
			subscription @client {
				id
				plan {
					id
				}
			}
			accessToken {
				id
				domains
				token
			}
		}
	}
`;

const UPDATE_ACCESS_TOKEN_DOMAINS = gql`
	mutation updateAccessTokenDomains($id: ID!, $domainNames: String!) {
		updateAccessToken(id: $id, domains: $domainNames) {
			domains
			token
		}
	}
`;

const CREATE_ACCESS_TOKEN = gql`
	mutation createTokenForUser($id: ID!, $domainNames: String!) {
		createAccessToken(userId: $id, domains: $domainNames) {
			id
			domains
			token
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

		return {
			refetch: data.refetch,
			user: data.user,
			subscription: data.user.subscription,
			domains: data.user.accessToken.domains.split(',') || [],
			isManagedAccount: data.user && data.user.manager,
			token: data.user.accessToken.token,
		};
	},
})(
	graphql(UPDATE_ACCESS_TOKEN_DOMAINS, {
		// we can't update if the access token hasn't been created first
		skip: ({user}) => !user || !user.accessToken,
		props: ({mutate, ownProps}) => ({
			updateDomains: domainNames =>
				mutate({
					variables: {
						id: ownProps.user.accessToken.id,
						domainNames: domainNames.join(','),
					},
				}),
		}),
		options: {
			update: (store, {data: {updateAccessToken}}) => {
				const data = store.readQuery({query});

				data.user.accessToken = {
					id: data.user.accessToken.id,
					...updateAccessToken,
				};

				store.writeQuery({
					query,
					data,
				});
			},
		},
	})(
		graphql(CREATE_ACCESS_TOKEN, {
			skip: ({user}) => !user || user.accessToken,
			props: ({mutate, ownProps}) => ({
				createAccessToken: () =>
					mutate({
						id: ownProps.user.id,
						domainNames: 'localhost',
					}),
			}),
			options: {
				update: (store, {data: {createAccessToken}}) => {
					const data = store.readQuery({query});

					data.user.accessToken = createAccessToken;

					store.writeQuery({
						query,
						data,
					});
				},
			},
		})(AccountPrototypoLibrary),
	),
);
