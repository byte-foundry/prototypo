import React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import backgroundColor from 'react-storybook-decorator-background';

import SliderController from '../app/scripts/components/slider-controller.components';

// TODO: use maybe Knobs to allow editing
// states would be 'default', ' with minAdvised', 'with maxAdvised'... ALso could be nice to have controlled / uncontrolled
// also, bugs should be fixed, when size is different than 260px, 0 is not really visually 0%
storiesOf('SliderController', module)
	.addDecorator((story) => {
		return <div style={{width: '300px', margin: 'auto', padding: '20px'}} className="normal">{story()}</div>;
	})
	.addDecorator(backgroundColor(['#3b3b3b']))
	.add('empty', () => {
		return (
			<SliderController
				changeParam={action('change-param')}
				disabled={false}
				label="Small Cap Thickness"
				max={100}
				maxAdvised={90}
				min={0}
				minAdvised={0}
				name="_scThickness"
				value={0}
			/>
		);
	})
	.add('50% filled', () => {
		return (
			<SliderController
				changeParam={action('change-param')}
				disabled={false}
				label="Small Cap Thickness"
				max={100}
				maxAdvised={90}
				min={0}
				minAdvised={10}
				name="_scThickness"
				value={50}
			/>
		);
	})
	.add('full', () => {
		return (
			<SliderController
				changeParam={action('change-param')}
				disabled={false}
				label="Small Cap Thickness"
				max={100}
				maxAdvised={100}
				min={0}
				minAdvised={10}
				name="_scThickness"
				value={100}
			/>
		);
	})
	.add('unadvised state', () => {
		return (
			<SliderController
				changeParam={action('change-param')}
				disabled={false}
				label="Small Cap Thickness"
				max={100}
				maxAdvised={90}
				min={0}
				minAdvised={10}
				name="_scThickness"
				value={95}
			/>
		);
	});
