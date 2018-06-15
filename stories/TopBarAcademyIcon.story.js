import React from 'react';
import {storiesOf} from '@storybook/react';
import backgroundColor from 'react-storybook-decorator-background';

import TopBarMenuAcademyIcon from '../app/scripts/components/topbar/top-bar-menu-academy-icon.components';

storiesOf('TopBar/MenuAcademyIcon', module)
	.addDecorator(story => (
		<div
			style={{width: '300px', margin: 'auto', padding: '20px'}}
			className="normal"
		>
			{story()}
		</div>
	))
	.addDecorator(backgroundColor(['#303030']))
	.add('default', () => (
		<TopBarMenuAcademyIcon icon={require('../app/images/graduate-cap.svg')} />
	))
	.add('hover', () => (
		<TopBarMenuAcademyIcon
			icon={require('../app/images/graduate-cap-green.svg')}
		/>
	));
