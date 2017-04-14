import React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import backgroundColor from 'react-storybook-decorator-background';

import AccountManageSubUsers from '../app/scripts/components/account/account-manage-sub-users.components';

storiesOf('account.AccountManageSubUsers', module)
	.addDecorator((story) => {
		return <div style={{width: '700px', margin: 'auto', padding: '20px'}} className="normal">{story()}</div>;
	})
	.addDecorator(backgroundColor(['#3b3b3b']))
	.add('empty state', () => {
		return (
			<AccountManageSubUsers
				members={[]}
			/>
		);
	})
	.add('empty state editable', () => {
		return (
			<AccountManageSubUsers
				members={[]}
				onAddUser={action('on-add-user')}
			/>
		);
	})
	.add('with 2 people', () => {
		return (
			<AccountManageSubUsers
				members={[{email: 'user@example.com'}, {email: 'user2@example.com'}]}
				onAddUser={action('on-add-user')}
			/>
		);
	})
	.add('with limited quantity', () => {
		return (
			<AccountManageSubUsers
				max={5}
				members={[{email: 'user@example.com'}, {email: 'user2@example.com'}]}
				onAddUser={action('on-add-user')}
			/>
		);
	})
	.add('full', () => {
		return (
			<AccountManageSubUsers
				max={2}
				members={[{email: 'user@example.com'}, {email: 'user2@example.com'}]}
				onAddUser={action('on-add-user')}
			/>
		);
	})
	.add('removable', () => {
		return (
			<AccountManageSubUsers
				max={2}
				members={[{email: 'user@example.com'}, {email: 'user2@example.com'}]}
				onAddUser={action('on-add-user')}
				onRemoveUser={action('on-remove-user')}
			/>
		);
	})
	.add('pending', () => {
		return (
			<AccountManageSubUsers
				max={2}
				members={[{email: 'user@example.com', status: 'pending'}]}
				onAddUser={action('on-add-user')}
				onRemoveUser={action('on-remove-user')}
			/>
		);
	});
