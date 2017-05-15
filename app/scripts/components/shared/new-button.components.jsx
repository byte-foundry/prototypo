import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

class Button extends React.Component {
	render() {
		const {
			size,
			children,
			className,
			...rest
		} = this.props;

		const classes = classnames(
			'new-button',
			{
				'new-button--tiny': size === 'tiny',
				'new-button--small': size === 'small',
				'new-button--large': size === 'large',
			},
			className,
		);

		return (
			<button className={classes} {...rest}>
				{children}
			</button>
		);
	}
}

Button.propTypes = {
	size: PropTypes.oneOf(['tiny', 'small', 'large']),
	className: PropTypes.string,
};

export default Button;
