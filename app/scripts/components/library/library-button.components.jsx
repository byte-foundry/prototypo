import React from 'react';
import classnames from 'classnames';

export default class LibraryButton extends React.Component {
	componentWillMount() {}

	render() {
		const {
			big,
			dark,
			highlight,
			floated,
			bold,
			full,
			loading,
			error,
			disabled,
			onClick,
			onBlur,
			name,
			...rest
		} = this.props;

		const classes = classnames('library-button', {
			'button-big': big,
			'button-dark': dark,
			'button-highlight': highlight,
			floated,
			'button-bold': floated,
			'button-full': full,
			'button-loading': loading,
			'button-error': error,
			'button-disabled': disabled,
		});

		return (
			<div
				tabIndex="1"
				className={classes}
				onMouseDown={onClick}
				onBlur={onBlur}
				{...rest}
			>
				{loading ? (
					<div className="sk-spinner-wave">
						<div className="sk-rect1" />
						<div className="sk-rect2" />
						<div className="sk-rect3" />
						<div className="sk-rect4" />
						<div className="sk-rect5" />
					</div>
				) : (
					<span>{name}</span>
				)}
			</div>
		);
	}
}
