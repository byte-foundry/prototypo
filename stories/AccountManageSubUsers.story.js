import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import backgroundColor from 'react-storybook-decorator-background';

import {AccountManageSubUsers} from '../app/scripts/components/account/account-manage-sub-users.components';

storiesOf('account/AccountManageSubUsers', module)
	.addDecorator(story => (
		<div
			style={{width: '700px', margin: 'auto', padding: '20px'}}
			className="normal"
		>
			{story()}
		</div>
	))
	.addDecorator(backgroundColor(['#3b3b3b']))
	.add('empty state', () => <AccountManageSubUsers members={[]} />)
	.add('loading', () => (
		<AccountManageSubUsers
			members={[{id: '1', email: 'user@example.com', status: 'loading'}]}
		/>
	))
	.add('pending', () => (
		<AccountManageSubUsers
			members={[{id: '1', email: 'user@example.com', status: 'pending'}]}
		/>
	))
	.add('active', () => (
		<AccountManageSubUsers
			members={[{id: '1', email: 'user@example.com', status: 'active'}]}
		/>
	))
	.add('with add user form', () => (
		<AccountManageSubUsers onAddUser={action('on-add-user')} />
	))
	.add('removable', () => (
		<AccountManageSubUsers
			members={[{id: '1', email: 'user@example.com', status: 'active'}]}
			onRemoveUser={action('on-remove-user')}
		/>
	))
	.add('with limited quantity', () => <AccountManageSubUsers max={10} />)
	.add('with short quantity left', () => (
		<AccountManageSubUsers
			max={5}
			members={[
				{id: '1', email: 'user@example.com', status: 'active'},
				{id: '2', email: 'user2@example.com', status: 'active'},
			]}
			onAddUser={action('on-add-user')}
			onRemoveUser={action('on-remove-user')}
		/>
	))
	.add('full', () => (
		<AccountManageSubUsers
			max={2}
			members={[
				{id: '1', email: 'user@example.com', status: 'active'},
				{id: '2', email: 'user2@example.com', status: 'active'},
			]}
			onAddUser={action('on-add-user')}
			onRemoveUser={action('on-remove-user')}
		/>
	));
