import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default class Modal extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

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
