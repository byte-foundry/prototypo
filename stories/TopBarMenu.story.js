import React from 'react';
import {storiesOf} from '@storybook/react';
import LocalClient from '../app/scripts/stores/local-client.stores';
import LocalServer from '../app/scripts/stores/local-server.stores';

import {TopBarMenuRaw} from '../app/scripts/components/topbar/top-bar-menu.components';
import TopBarMenuItem from '../app/scripts/components/topbar/top-bar-menu-item.components';

const localServer = new LocalServer({}).instance;

LocalClient.setup(localServer);

storiesOf('TopBar/Menu', module)
	.add('empty', () => <TopBarMenuRaw />)
	.add('with items', () => (
		<TopBarMenuRaw>
			<TopBarMenuItem name="Item 1">Item 1</TopBarMenuItem>
			<TopBarMenuItem name="Item 1">Item 2</TopBarMenuItem>
			<TopBarMenuItem name="Item 1">Item 3</TopBarMenuItem>
		</TopBarMenuRaw>
	));
