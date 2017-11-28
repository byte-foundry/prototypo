import React from 'react';
import {storiesOf} from '@storybook/react';
import backgroundColor from 'react-storybook-decorator-background';

import {TopBarMenuRaw} from '../app/scripts/components/topbar/top-bar-menu.components';

import TopBarMenuDropdown from '../app/scripts/components/topbar/top-bar-menu-dropdown.components';

import TopBarMenuDropdownItem from '../app/scripts/components/topbar/top-bar-menu-dropdown-item.components';

storiesOf('TopBar/MenuDropdown', module)
	.addDecorator(story => (
		<div className="normal">
			<TopBarMenuRaw>{story()}</TopBarMenuRaw>
		</div>
	))
	.addDecorator(backgroundColor(['#3b3b3b']))
	.add('default', () => (
		<TopBarMenuDropdown selected name="Test">
			<li>Insert items here</li>
		</TopBarMenuDropdown>
	))
	.add('small', () => (
		<TopBarMenuDropdown name="Test" small>
			<li>Insert items here</li>
		</TopBarMenuDropdown>
	))
	.add('with item', () => (
		<TopBarMenuDropdown name="Test">
			<TopBarMenuDropdownItem name="This is an item" />
		</TopBarMenuDropdown>
	));
