import React from 'react';

export default class Modal extends React.Component {
	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] Modal');
		}
		let content;
		if (this.props.show) {
		return (
			<div className="modal-container">
				<div className="modal-container-backdrop"></div>
				<div className="modal-container-content">
					{this.props.children}
				</div>
			</div>
		)
		}
		else {
			return false;
		}

	}
}
