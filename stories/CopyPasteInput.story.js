import React from 'react';
import {storiesOf} from '@storybook/react';

import CopyPasteInput from '../app/scripts/components/shared/copy-paste-input.components';

storiesOf('shared/CopyPasteInput', module)
	.addDecorator(story => (
		<div
			style={{margin: 'auto', padding: '20px', textAlign: 'center'}}
			className="normal"
		>
			{story()}
		</div>
	))
	.add('default', () => <CopyPasteInput content="hello" />);
