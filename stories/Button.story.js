import React from 'react';
import {storiesOf} from '@kadira/storybook';

import Button from '../app/scripts/components/shared/new-button.components';

storiesOf('shared.Button', module)
	.add('default', () => <Button>Hit me!</Button>)
	.add('size="tiny"', () => <Button size="tiny">Hit me!</Button>)
	.add('size="small"', () => <Button size="small">Hit me!</Button>)
	.add('size="large"', () => <Button size="large">Hit me!</Button>)
;
