import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import backgroundColor from 'react-storybook-decorator-background';

import {AccountManageSubUsers} from '../app/scripts/components/account/account-manage-sub-users.components';

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
	.add('loading', () => {
		return (
			<AccountManageSubUsers
				members={[{email: 'user@example.com', status: 'loading'}]}
			/>
		);
	})
	.add('pending', () => {
		return (
			<AccountManageSubUsers
				members={[{email: 'user@example.com', status: 'pending'}]}
			/>
		);
	})
	.add('active', () => {
		return (
			<AccountManageSubUsers
				members={[{email: 'user@example.com', status: 'active'}]}
			/>
		);
	})
	.add('with add user form', () => {
		return (
			<AccountManageSubUsers onAddUser={action('on-add-user')} />
		);
	})
	.add('removable', () => {
		return (
			<AccountManageSubUsers
				members={[{email: 'user@example.com', status: 'active'}]}
				onRemoveUser={action('on-remove-user')}
			/>
		);
	})
	.add('with limited quantity', () => {
		return (
			<AccountManageSubUsers
				max={10}
			/>
		);
	})
	.add('with short quantity left', () => {
		return (
			<AccountManageSubUsers
				max={5}
				members={[{email: 'user@example.com', status: 'active'}, {email: 'user2@example.com', status: 'active'}]}
				onAddUser={action('on-add-user')}
				onRemoveUser={action('on-remove-user')}
			/>
		);
	})
	.add('full', () => {
		return (
			<AccountManageSubUsers
				max={2}
				members={[{email: 'user@example.com', status: 'active'}, {email: 'user2@example.com', status: 'active'}]}
				onAddUser={action('on-add-user')}
				onRemoveUser={action('on-remove-user')}
			/>
		);
	});
