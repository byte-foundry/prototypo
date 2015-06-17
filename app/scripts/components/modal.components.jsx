import React from 'react';

export default class Modal extends React.Component {
	render() {
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
