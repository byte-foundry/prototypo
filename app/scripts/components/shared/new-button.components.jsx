import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

class Button extends React.Component {
	render() {
		const {
			size,
			disabled,
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
				'new-button--disabled': disabled,
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
	className: PropTypes.string,
};

export default Button;
