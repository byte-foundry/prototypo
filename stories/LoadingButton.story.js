import React from 'react';
import {storiesOf} from '@storybook/react';

import Button from '../app/scripts/components/shared/loading-button.components';

storiesOf('shared/LoadingButton', module)
	.addDecorator(story => (
		<div
			style={{margin: 'auto', padding: '20px', textAlign: 'center'}}
			className="normal"
		>
			{story()}
		</div>
	))
	.add('default', () => <Button>Hit me!</Button>)
	.add('loading', () => <Button loading>You can't hit me!</Button>);
