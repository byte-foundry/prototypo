import PropTypes from 'prop-types';
import React from 'react';

import Button from '../shared/new-button.components';
import WaitForLoad from '../wait-for-load.components';

const LoadingButton = ({loading, disabled, children, outline, ...rest}) => (
	<Button disabled={disabled || loading} outline={outline} {...rest}>
		<WaitForLoad loaded={!loading} secColor={!outline}>
			{children}
		</WaitForLoad>
	</Button>
);

LoadingButton.defaultProps = {
	loading: false,
};

LoadingButton.propTypes = {
	...Button.propTypes,
	loading: PropTypes.bool,
};

export default LoadingButton;
