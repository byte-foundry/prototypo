import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import Modal from '../shared/modal.components.jsx';
import {AddVariant} from './add-family-variant.components.jsx';

export default class CreateVariantModal extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		return (
			<Modal propName={this.props.propName}>
				<div className="modal-container-title account-header">Add variant</div>
				<div className="modal-container-content">
					<AddVariant family={this.props.family}/>
				</div>
			</Modal>
		);
	}
}
