import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import backgroundColor from 'react-storybook-decorator-background';

import SliderController from '../app/scripts/components/slider-controller.components';

// TODO: use maybe Knobs to allow editing
// states would be 'default', ' with minAdvised', 'with maxAdvised'... ALso could be nice to have controlled / uncontrolled
// also, bugs should be fixed, when size is different than 260px, 0 is not really visually 0%
storiesOf('SliderController', module)
	.addDecorator(story => (
		<div
			style={{width: '300px', margin: 'auto', padding: '20px'}}
			className="normal"
		>
			{story()}
		</div>
	))
	.addDecorator(backgroundColor(['#3b3b3b']))
	.add('empty', () => (
		<SliderController
			changeParam={action('change-param')}
			label="Small Cap Thickness"
			max={100}
			maxAdvised={90}
			min={0}
			minAdvised={0}
			name="_scThickness"
			value={0}
		/>
	))
	.add('disabled', () => (
		<SliderController
			disabled
			changeParam={action('change-param')}
			label="Small Cap Thickness"
			max={100}
			maxAdvised={90}
			min={0}
			minAdvised={0}
			name="_scThickness"
			value={0}
		/>
	))
	.add('50% filled', () => (
		<SliderController
			changeParam={action('change-param')}
			label="Small Cap Thickness"
			max={100}
			maxAdvised={90}
			min={0}
			minAdvised={10}
			name="_scThickness"
			value={50}
		/>
	))
	.add('full', () => (
		<SliderController
			changeParam={action('change-param')}
			label="Small Cap Thickness"
			max={100}
			maxAdvised={100}
			min={0}
			minAdvised={10}
			name="_scThickness"
			value={100}
		/>
	))
	.add('unadvised state', () => (
		<SliderController
			changeParam={action('change-param')}
			label="Small Cap Thickness"
			max={100}
			maxAdvised={90}
			min={0}
			minAdvised={10}
			name="_scThickness"
			value={95}
		/>
	));
