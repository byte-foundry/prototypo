import React from 'react';

export default class CloseButton extends React.Component {
	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] close button');
		}

		return (
			<div
				onClick={this.props.click}
				className="close-button">
				<div className="close-button-icon"></div>
			</div>
		);
	}
}
