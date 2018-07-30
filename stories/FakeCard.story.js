import React from 'react';
import {storiesOf} from '@storybook/react';

import FakeCard from '../app/scripts/components/shared/fake-card.components';

storiesOf('shared/FakeCard', module)
	.addDecorator(story => (
		<div style={{margin: 'auto', padding: '20px'}}>{story()}</div>
	))
	.add('default', () => <FakeCard />)
	.add('custom values', () => (
		<FakeCard
			card={{
				name: 'Jean Michel Avous',
				last4: '4242',
				exp_month: 12,
				exp_year: 25,
			}}
		/>
	));
