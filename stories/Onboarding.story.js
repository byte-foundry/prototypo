import React from 'react';
import {storiesOf} from '@storybook/react';

import OnboardingStep from '../app/scripts/components/onboarding/step.components';

storiesOf('onboarding/OnboardingStep', module)
	.add('start', () => (
		<OnboardingStep title="Title" type="start" description={['description']} />
	))
	.add('sliders', () => (
		<OnboardingStep
			type="sliders"
			description={['description']}
			letters="these are the letters"
			sliders={['thickness']}
			parameters={[{name: 'thickness', label: 'thickness'}]}
			values={{thickness: 80}}
			fontName="sans-serif"
		/>
	))
	.add('serifs', () => (
		<OnboardingStep
			type="serifs"
			description={['description']}
			letters="these are the letters"
			sliders={['serifWidth']}
			parameters={[{name: 'serifWidth', label: 'serif width'}]}
			values={{serifWidth: 80}}
			fontName="sans-serif"
		/>
	))
	.add('finish', () => (
		<OnboardingStep
			type="finish"
			fontName="sans-serif"
			description={['description']}
		/>
	));
