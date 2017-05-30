import React from 'react';
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
	name: React.PropTypes.string.isRequired,
	onClick: React.PropTypes.func,
};

IconButton.defaultProps = {
	onClick: () => {},
};

export default IconButton;
