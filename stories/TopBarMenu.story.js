import React from 'react';
import {storiesOf} from '@storybook/react';

import {TopBarMenuRaw} from '../app/scripts/components/topbar/top-bar-menu.components';
import TopBarMenuItem from '../app/scripts/components/topbar/top-bar-menu-item.components';

storiesOf('TopBar/Menu', module)
	.add('empty', () => <TopBarMenuRaw />)
	.add('with items', () => (
		<TopBarMenuRaw>
			<TopBarMenuItem name="Item 1">Item 1</TopBarMenuItem>
			<TopBarMenuItem name="Item 1">Item 2</TopBarMenuItem>
			<TopBarMenuItem name="Item 1">Item 3</TopBarMenuItem>
		</TopBarMenuRaw>
	));
