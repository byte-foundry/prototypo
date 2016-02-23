import React from 'react';

export default class DisplayWithLabel extends React.Component {
	render() {
		const label = this.props.nolabel
			? false
			: <label className="display-with-label-label">{this.props.label}</label>;

		return (
			<div className="display-with-label">
				{label}
				<div className="display-with-label-display">
					{this.props.data}
				</div>
			</div>
		);
	}
}
