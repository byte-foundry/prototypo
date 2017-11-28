import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';

import {TopBarMenuRaw} from '../app/scripts/components/topbar/top-bar-menu.components';

import TopBarMenuAcademy from '../app/scripts/components/topbar/top-bar-menu-academy.components';

const course = {
	name: 'Course test',
	slug: 'course-test',
	parts: [{name: 'Part 1'}, {name: 'Part 2'}, {name: 'Part 3'}],
};

storiesOf('TopBar/MenuAcademy', module)
	.addDecorator(story => (
		<div className="normal">
			<TopBarMenuRaw>{story()}</TopBarMenuRaw>
		</div>
	))
	.add('default', () => (
		<TopBarMenuAcademy
			setText={action('set-text')}
			clearText={action('clear-text')}
			icon={require('../app/images/graduate-cap.svg')}
			course={course}
			headerClassName="academy-progress-container"
		/>
	))
	.add('with text set (hover)', () => (
		<TopBarMenuAcademy
			setText={action('set-text')}
			clearText={action('clear-text')}
			icon={require('../app/images/graduate-cap.svg')}
			course={course}
			text="Test - Part 1"
			headerClassName="academy-progress-container"
		/>
	));
