import React from 'react';

export default class CloseButton extends React.Component {
	render() {
		return (
			<div
				onClick={this.props.click}
				className="close-button">
			</div>
		)
	}
}
