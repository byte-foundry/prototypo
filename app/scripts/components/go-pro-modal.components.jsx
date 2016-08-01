import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import Modal from './shared/modal.components.jsx';

export default class GoProModal extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		return (
			<Modal propName={this.props.propName}>
				<div className="modal-container-title">PRO VERSION?</div>
				<p>Go pro-totypo!</p>
			</Modal>
		);
	}
}
