import React from 'react';
import {storiesOf} from '@storybook/react';

import AccountValidationButton from '../app/scripts/components/shared/account-validation-button.components';

storiesOf('shared/AccountValidationButton', module)
	.add('default', () => <AccountValidationButton label="Hit me!" />)
	.add('loading', () => <AccountValidationButton label="Hit me!" loading />)
	.add('disabled', () => (
		<AccountValidationButton label="You can't hit me!" disabled />
	));
