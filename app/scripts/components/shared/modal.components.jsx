import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

export default class Modal extends React.Component {
	render() {
		return (
			<div className="modal">
				<div className="modal-container">
					{this.props.children}
				</div>
			</div>
		);
	}
}
