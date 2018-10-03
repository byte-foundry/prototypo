import React from 'react';

import Dashboard from './account-dashboard.components';
import AccountManageSubUsers from './account-manage-sub-users.components';

export default class AccountOrganization extends React.Component {
	render() {
		return (
			<Dashboard title="Organization">
				<div className="account-base account-organization">
					<AccountManageSubUsers />
				</div>
			</Dashboard>
		);
	}
}
