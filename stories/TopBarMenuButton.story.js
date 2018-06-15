import React from 'react';
import {storiesOf} from '@storybook/react';

import {TopBarMenuRaw} from '../app/scripts/components/topbar/top-bar-menu.components';

import TopBarMenuButton from '../app/scripts/components/topbar/top-bar-menu-button.components';

storiesOf('TopBar/MenuButton', module)
	.addDecorator(story => (
		<div className="normal">
			<TopBarMenuRaw>{story()}</TopBarMenuRaw>
		</div>
	))
	.add('default', () => (
		<TopBarMenuButton noHover centered alignRight label="Hit me" />
	));
