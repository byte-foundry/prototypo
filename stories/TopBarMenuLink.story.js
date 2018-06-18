import React from 'react';
import {storiesOf} from '@storybook/react';

import {TopBarMenuRaw} from '../app/scripts/components/topbar/top-bar-menu.components';

import TopBarMenuLink from '../app/scripts/components/topbar/top-bar-menu-link.components';

storiesOf('TopBar/MenuLink', module)
	.addDecorator(story => (
		<div className="normal">
			<TopBarMenuRaw>{story()}</TopBarMenuRaw>
		</div>
	))
	.add('default', () => (
		<TopBarMenuLink
			link="/account"
			title="Account settings"
			img="icon-profile.svg"
			action
		/>
	))
	.add('darkBackground', () => (
		<TopBarMenuLink
			link="/account"
			title="Account settings"
			img="icon-profile.svg"
			imgDarkBackground
			action
		/>
	))
	.add('alignRight', () => (
		<TopBarMenuLink
			link="/account"
			title="Account settings"
			img="icon-profile.svg"
			alignRight
			action
		/>
	));
