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
			link,
			...rest
		} = this.props;

		const classes = classnames(
			'new-button',
			{
				'new-button--tiny': size === 'tiny',
				'new-button--small': size === 'small',
				'new-button--big': size === 'big',
				'new-button--large': size === 'large',
				'new-button--disabled': disabled,
				'new-button--outline': !link && outline,
				'new-button--fluid': fluid,
				'new-button--neutral': neutral,
				'new-button--link': link,
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

Button.defaultProps = {
	type: 'button',
	size: null,
	disabled: false,
	outline: false,
	fluid: false,
	className: '',
	neutral: false,
	link: false,
};

Button.propTypes = {
	type: PropTypes.oneOf(['submit', 'reset', 'button', 'menu']),
	size: PropTypes.oneOf(['tiny', 'small', 'big', 'large']),
	disabled: PropTypes.bool,
	outline: PropTypes.bool,
	fluid: PropTypes.bool,
	className: PropTypes.string,
	neutral: PropTypes.bool,
	link: PropTypes.bool,
};

export default Button;
