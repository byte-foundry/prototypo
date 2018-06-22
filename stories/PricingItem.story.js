import React from 'react';
import {storiesOf} from '@storybook/react';

import PricingItem from '../app/scripts/components/shared/pricing-item.components';

storiesOf('shared/PricingItem', module)
	.addDecorator(story => (
		<div
			style={{width: '300px', margin: 'auto', padding: '20px'}}
			className="normal"
		>
			{story()}
		</div>
	))
	.add('default', () => <PricingItem currency="EUR" amount={5} />)
	.add('$$$', () => <PricingItem currency="USD" amount={5} />)
	.add('selected', () => <PricingItem currency="EUR" amount={5} selected />)
	.add('with title', () => (
		<PricingItem currency="EUR" amount={5} title="Monthly" />
	))
	.add('with price info', () => (
		<PricingItem currency="EUR" amount={5} priceInfo="Billed annually" />
	))
	.add('with children', () => (
		<PricingItem currency="EUR" amount={5} priceInfo="Billed annually">
			<p style={{padding: '10px', textAlign: 'center', margin: '0'}}>
				You can put anything you want to extend this element
			</p>
		</PricingItem>
	));
