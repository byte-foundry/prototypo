import React from 'react';
import {storiesOf} from '@storybook/react';
import backgroundColor from 'react-storybook-decorator-background';

import SubscriptionSidebar from '../app/scripts/components/account/subscription-sidebar.components';

storiesOf('account.SubscriptionSidebar', module)
	.addDecorator(story => (
		<div style={{width: '350px', margin: '20px auto'}}>
			{story()}
		</div>
	))
	.addDecorator(backgroundColor(['#24d390']))
	.add('personal_monthly', () => <SubscriptionSidebar plan="personal_monthly" />)
	.add('personal_monthly (no first month offer)', () => (
		<SubscriptionSidebar plan="personal_monthly" hasBeenSubscribing />
	))
	.add('personal_annual_99', () => <SubscriptionSidebar plan="personal_annual_99" />)
	.add('agency_monthly', () => <SubscriptionSidebar plan="agency_monthly" />)
	.add('agency_annual', () => <SubscriptionSidebar plan="agency_annual" />);
