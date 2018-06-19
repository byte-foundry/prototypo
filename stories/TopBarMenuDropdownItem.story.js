import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import backgroundColor from 'react-storybook-decorator-background';

import TopBarMenuDropdownItem from '../app/scripts/components/topbar/top-bar-menu-dropdown-item.components';

storiesOf('TopBar/MenuDropdownItem', module)
	.addDecorator(story => (
		<div
			style={{width: '300px', margin: 'auto', padding: '20px'}}
			className="normal"
		>
			{story()}
		</div>
	))
	.addDecorator(backgroundColor(['#3b3b3b']))
	.add('default', () => (
		<TopBarMenuDropdownItem name="Title" handler={action('handler')} />
	))
	.add('with separator', () => (
		<TopBarMenuDropdownItem
			name="Title"
			separator
			handler={action('handler')}
		/>
	))
	.add('with extra content', () => (
		<TopBarMenuDropdownItem name="Title" handler={action('handler')}>
			Extra content
		</TopBarMenuDropdownItem>
	))
	.add('checkbox', () => (
		<TopBarMenuDropdownItem name="Title" checkbox handler={action('handler')} />
	))
	.add('checkbox checked', () => (
		<TopBarMenuDropdownItem
			name="Title"
			checkbox
			active
			handler={action('handler')}
		/>
	))
	.add('disabled', () => <TopBarMenuDropdownItem name="Title" disabled />)
	.add('shortcut', () => (
		<TopBarMenuDropdownItem
			name="Title"
			shortcut="Ctrl + Z"
			handler={action('handler')}
		/>
	));
