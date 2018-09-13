import React from 'react';
import {storiesOf} from '@storybook/react';

import HostVariant from '../app/scripts/components/host-variant.components';

storiesOf('HostVariant', module)
	.addDecorator(story => (
		<div
			style={{margin: 'auto', padding: '20px', textAlign: 'center'}}
			className="normal"
		>
			{story()}
		</div>
	))
	.add('default', () => <HostVariant />)
	.add('with hosted files', () => (
		<HostVariant
			latestUploadUrl="example.org"
			uploads={[
				{
					name: 'Regular',
					createdAt: '2018-01-01T19:49:34.000Z',
					url: 'example.org/myfont?versionId=46fwe63',
					version: '46fwe63',
				},
			]}
		/>
	))
	.add('custom status', () => (
		<HostVariant
			status="generating"
			latestUploadUrl="example.org"
			uploads={[
				{
					name: 'Regular',
					createdAt: '2018-01-01T19:49:34.000Z',
					url: 'example.org/myfont?versionId=46fwe63',
					version: '46fwe63',
				},
			]}
		/>
	))
	.add('empty with custom status', () => <HostVariant status="hosting" />);
