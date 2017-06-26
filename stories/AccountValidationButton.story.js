import React from 'react';
import {storiesOf} from '@kadira/storybook';

import AccountValidationButton from '../app/scripts/components/shared/account-validation-button.components';

storiesOf('shared.AccountValidationButton', module)
	.add('default', () => {
		return <AccountValidationButton label="Hit me!" />;
	})
	.add('loading', () => {
		return <AccountValidationButton label="Hit me!" loading={true} />;
	})
	.add('disabled', () => {
		return <AccountValidationButton label="You can't hit me!" disabled={true} />;
	});
