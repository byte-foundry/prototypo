import React from 'react';
import {storiesOf} from '@storybook/react';

import Button from '../app/scripts/components/shared/new-button.components';

storiesOf('shared/Button', module)
	.addDecorator(story => (
		<div
			style={{margin: 'auto', padding: '20px', textAlign: 'center'}}
			className="normal"
		>
			{story()}
		</div>
	))
	.add('default', () => <Button>Hit me!</Button>)
	.add('disabled', () => <Button disabled>You can't hit me!</Button>)
	.add('size="tiny"', () => <Button size="tiny">Hit me!</Button>)
	.add('size="small"', () => <Button size="small">Hit me!</Button>)
	.add('size="large"', () => <Button size="large">Hit me!</Button>)
	.add('outline', () => <Button outline>Hit me!</Button>)
	.add('fluid', () => <Button fluid>Hit me!</Button>);
