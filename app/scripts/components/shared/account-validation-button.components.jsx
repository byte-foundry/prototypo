import React from 'react';
import classNames from 'classnames';

import Button from '../shared/new-button.components';
import WaitForLoad from '../wait-for-load.components';

export default class AccountValidationButton extends React.PureComponent {
	render() {
		const {
			loading,
			disabled,
			click,
			label,
			outline,
			children,
			className,
			...rest
		} = this.props;
		const type = click ? 'button' : 'submit';

		const classes = classNames(className, 'account-button account-validation-button');

		return (
			<Button
				type={type}
				className={classes}
				disabled={disabled || loading}
				onClick={click}
				outline={outline}
				{...rest}
			>
				<WaitForLoad loaded={!loading} secColor={!outline}>
					{children || label}
				</WaitForLoad>
			</Button>
		);
	}
}
