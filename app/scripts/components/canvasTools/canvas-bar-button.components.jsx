import React from 'react';
import Classnames from 'classnames';

export default class CanvasBarButton extends React.PureComponent {
	render() {
		const classes = Classnames({
			[this.props.name]: true,
			'canvas-bar-button': true,
			'is-active': this.props.active,
		});

		return (
			<div
				className={classes}
				onClick={() => {
					this.props.click(this.props.name);
				}}
			/>
		);
	}
}
