import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

class Button extends React.Component {
	render() {
		const {
			size,
			disabled,
			outline,
			fluid,
			children,
			className,
			neutral,
			...rest
		} = this.props;

		const classes = classnames(
			'new-button',
			{
				'new-button--tiny': size === 'tiny',
				'new-button--small': size === 'small',
				'new-button--large': size === 'large',
				'new-button--disabled': disabled,
				'new-button--outline': outline,
				'new-button--fluid': fluid,
				'new-button--neutral': neutral,
			},
			className,
		);

		return (
			<button className={classes} disabled={disabled} {...rest}>
				{children}
			</button>
		);
	}
}

Button.propTypes = {
	size: PropTypes.oneOf(['tiny', 'small', 'large']),
	disabled: PropTypes.bool,
	outline: PropTypes.bool,
	fluid: PropTypes.bool,
	className: PropTypes.string,
};

export default Button;
