import React from 'react';
import classnames from 'classnames';

import LoadingButton from '../shared/loading-button.components';

export default class LibraryButton extends React.Component {
	render() {
		const {
			big,
			dark,
			highlight,
			floated,
			bold,
			full,
			error,
			disabled,
			name,
			...rest
		} = this.props;

		const classes = classnames('library-button', {
			'button-big': big,
			'button-dark': dark,
			'button-highlight': highlight,
			'button-bold': bold,
			'button-error': error,
			'button-disabled': disabled,
		});

		return (
			<LoadingButton
				className={classes}
				fluid={floated === false || full}
				disabled={disabled}
				outline
				{...rest}
			>
				{name}
			</LoadingButton>
		);
	}
}
