import React from 'react';
import Lifespan from 'lifespan';

import LocalClient from '../../stores/local-client.stores.jsx';

import Dashboard from './account-dashboard.components';
import AccountManageSubUsers from './account-manage-sub-users.components';

export default class AccountOrganization extends React.Component {
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

		return (
			<Dashboard title="Organization">
				<div className="account-base account-organization">
					<AccountManageSubUsers max={subscription && subscription.quantity} />
				</div>
			</Dashboard>
		);
	}
}
