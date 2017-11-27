import React from 'react';
import {storiesOf} from '@storybook/react';
import backgroundColor from 'react-storybook-decorator-background';

import AccountPage from '../app/scripts/components/account/account-page.components';

storiesOf('account/AccountPage', module)
	.addDecorator(story => <div style={{padding: '20px'}}>{story()}</div>)
	.addDecorator(backgroundColor(['#24d390', '#3b3b3b']))
	.add('default', () => <AccountPage />)
	.add('with content', () => <AccountPage>Content</AccountPage>)
	.add('with title', () => <AccountPage title="Page Title" />)
	.add('with subtitle', () => <AccountPage title="Page Title" subtitle="Page Subtitle" />);
