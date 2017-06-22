import React from 'react';
import classNames from 'classnames';
import {Link, withRouter} from 'react-router';
import Lifespan from 'lifespan';
import {graphql, gql} from 'react-apollo';

import LocalClient from '../../stores/local-client.stores';

class AccountSidebarLinkRaw extends React.Component {
	render() {
		const {to, label, slug, children, router} = this.props;

		const classes = classNames({
			'is-active': router.isActive(to),
			'account-sidebar-menu-item': true,
			[`account-sidebar-menu-${slug}`]: true,
		});

		return (
			<li className={classes}>
				<Link to={to}>{label}</Link>
				{children && <ul className="account-sidebar-menu-item-options">{children}</ul>}
			</li>
		);
	}
}

const AccountSidebarLink = withRouter(AccountSidebarLinkRaw);

class AccountSidebarSubLinkRaw extends React.Component {
	render() {
		const {to, label, router} = this.props;

		const classes = classNames({
			'is-active': router.isActive(to),
			'account-sidebar-menu-item-options-item': true,
		});

		return (
			<li className={classes}>
				<Link to={to}>{label}</Link>
			</li>
		);
	}
}

const AccountSidebarSubLink = withRouter(AccountSidebarSubLinkRaw);

class AccountSidebar extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client
			.getStore('/userStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					subscription: head.toJS().d.subscription,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		const {subscription} = this.state;
		const {managed} = this.props;

		const accountsLinks = [];

		if (subscription || managed) {
			accountsLinks.push([
				<AccountSidebarSubLink to="/account/details/add-card" label="Add a card" />,
				<AccountSidebarSubLink to="/account/details/billing-address" label="My billing address" />,
			]);
		}

		if (subscription) {
			accountsLinks.push(
				<AccountSidebarSubLink to="/account/details/change-plan" label="Change plan" />,
			);
		}

		return (
			<div className="account-sidebar">
				<ul className="account-sidebar-menu">

					<AccountSidebarLink to="/account/home" slug="home" label="Home" />
					<AccountSidebarLink to="/account/profile" slug="profile" label="My profile">
						<AccountSidebarSubLink to="/account/profile/change-password" label="Change password" />
					</AccountSidebarLink>
					<AccountSidebarLink to="/account/details" slug="account" label="Account settings">
						{accountsLinks.length > 0
							? accountsLinks
							: [
								<AccountSidebarSubLink
									to="/account/subscribe"
									label="Subscribe to the pro plan"
								/>,
								<AccountSidebarSubLink
									to="/account/subscribe?plan=agency"
									label="Subscribe to the agency plan"
								/>,
							]}
					</AccountSidebarLink>
					{subscription
						&& subscription.quantity > 1
						&& <AccountSidebarLink
							to="/account/organization"
							slug="organization"
							label="Manage sub users"
						/>}
					<AccountSidebarLink to="/account/prototypo-library" slug="account" label="Developers" />
					<AccountSidebarLink to="/account/billing" slug="billing" label="Billing history" />
				</ul>
			</div>
		);
	}
}

const query = gql`
	query {
		user {
			id
			manager {
				id
			}
		}
	}
`;

export default graphql(query, {
	props: ({data}) => {
		if (data.loading) {
			return {loading: true};
		}

		if (data.user) {
			return {
				managed: !!data.user.manager,
			};
		}

		return {};
	},
})(AccountSidebar);
