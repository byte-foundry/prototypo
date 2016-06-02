import React from 'react';
import ClassNames from 'classnames';

export default class Button extends React.Component {
	render() {
		const classes = ClassNames({
			button: true,
			danger: this.props.danger,
			neutral: this.props.neutral,
		});

		return (
			<div className={classes} onClick={this.props.click}>
				{this.props.label}
			</div>
		);
	}
}
