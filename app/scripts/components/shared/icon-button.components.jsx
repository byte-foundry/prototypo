import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Icon from './icon.components';

class IconButton extends React.Component {
	render() {
		const {children, className, ...rest} = this.props;

		const classes = classnames('icon-button', className);

		return (
			<button className={classes} {...rest}>
				<Icon name={this.props.name} />
				{children}
			</button>
		);
	}
}

IconButton.propTypes = {
	name: PropTypes.string.isRequired,
	onClick: PropTypes.func,
};

IconButton.defaultProps = {
	onClick: () => {},
};

export default IconButton;
