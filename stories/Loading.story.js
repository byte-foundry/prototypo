import React from 'react';
import {storiesOf} from '@storybook/react';

import Loading from '../app/scripts/components/wait-for-load.components';

storiesOf('shared/Loading', module)
	.addDecorator(story => (
		<div style={{margin: 'auto', padding: '20px'}}>{story()}</div>
	))
	.add('default', () => <Loading>Not loading</Loading>)
	.add('loading', () => <Loading loading={true}>Not loading</Loading>)
	.add('size="tiny"', () => <Loading loading={true} size="tiny" />)
	.add('size="small"', () => <Loading loading={true} size="small" />)
	.add('size="big"', () => <Loading loading={true} size="big" />)
	.add('size="large"', () => <Loading loading={true} size="large" />)
	.add('inside a block', () => (
		<div style={{height: '300px', backgroundColor: 'black'}}>
			<Loading loading={true} />
		</div>
	))
	.add('secColor', () => (
		<div style={{height: '300px', backgroundColor: 'black'}}>
			<Loading loading={true} secColor={true} />
		</div>
	));
