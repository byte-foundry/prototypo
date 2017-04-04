import React from 'react';
import classNames from 'classnames';
import {Link} from 'react-router';
import Lifespan from 'lifespan';
import {graphql} from 'react-apollo';
import gql from 'graphql-tag';

import LocalClient from '../../stores/local-client.stores.jsx';

class AccountSidebarLink extends React.Component {
	render() {
		const {to, label, slug, children} = this.props;

		const classes = classNames({
			"is-active": this.context.router.isActive(this.props.to),
			"account-sidebar-menu-item": true,
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

AccountSidebarLink.contextTypes = {
	router: React.PropTypes.object.isRequired,
};

class AccountSidebarSubLink extends React.Component {
	render() {
		const classes = classNames({
			"is-active": this.context.router.isActive(this.props.to),
			"account-sidebar-menu-item-options-item": true,
		});

		return (
			<li className={classes}>
				<Link to={this.props.to}>{this.props.label}</Link>
			</li>
		);
	}
}

AccountSidebarSubLink.contextTypes = {
	router: React.PropTypes.object.isRequired,
};

class AccountSidebar extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
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
			accountsLinks.push(<AccountSidebarSubLink to="/account/details/change-plan" label="Change plan" />);
		}

		return (
			<div className="account-sidebar">
				<ul className="account-sidebar-menu">
					<AccountSidebarLink to="/account/home" slug="home" label="Home" />
					<AccountSidebarLink to="/account/profile" slug="profile" label="My profile">
						<AccountSidebarSubLink to="/account/profile/change-password" label="Change password" />
					</AccountSidebarLink>
					<AccountSidebarLink to="/account/details" slug="account" label="Account settings">
						{accountsLinks.length > 0 ? accountsLinks : <AccountSidebarSubLink to="/account/subscribe" label="Subscribe to the pro plan" />}
					</AccountSidebarLink>
					{subscription && subscription.quantity > 1 && (
						<AccountSidebarLink to="/account/organization" slug="organization" label="Manage sub users" />
					)}
					<AccountSidebarLink to="/account/billing" slug="billing" label="Billing history" />
				</ul>
			</div>
		);
	}
}

AccountSidebar.contextTypes = {
	router: React.PropTypes.object.isRequired,
};

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
