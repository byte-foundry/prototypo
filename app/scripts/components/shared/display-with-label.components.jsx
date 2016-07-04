import React from 'react';

export default class DisplayWithLabel extends React.Component {
	render() {
		const label = this.props.nolabel
			? false
			: <label className="display-with-label-label">{this.props.label}</label>;
		const classes = `display-with-label ${this.props.className}`;

		return (
			<div className={classes}>
				{label}
				<div className="display-with-label-display">
					{this.props.children}
				</div>
			</div>
		);
	}
}
