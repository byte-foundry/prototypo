import React from 'react';

export default class DisplayWithLabel extends React.Component {
	render() {
		return (
			<div className="display-with-label">
				<label className="display-with-label-label">{this.props.label}</label>
				<div className="display-with-label-display">
					{this.props.data}
				</div>
			</div>
		);
	}
}
