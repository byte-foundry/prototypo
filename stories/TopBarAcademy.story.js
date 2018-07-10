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
	.add('default', () => <TopBarAcademy headerClassName="no-hover" />)
	.add('with text set (hover)', () => (
		<TopBarAcademy headerClassName="no-hover" course={course} />
	));
