import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

export default class Modal extends React.Component {
	render() {
		return (
			<ReactCSSTransitionGroup
				component="div"
				transitionName="modal"
				className="modal"
				transitionAppear={true}
				transitionAppearTimeout={5000}
				transitionEnterTimeout={200}
				transitionLeaveTimeout={200}>
				<ReactCSSTransitionGroup
					component="div"
					transitionName="modal-container"
					className="modal-container"
					transitionAppear={true}
					transitionAppearTimeout={200}
					transitionEnterTimeout={200}
					transitionLeaveTimeout={200}>
					{this.props.children}
				</ReactCSSTransitionGroup>
			</ReactCSSTransitionGroup>
		);
	}
}
