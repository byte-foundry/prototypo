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
			<Modal>
				<div className="modal-container-title">Add variant</div>
				<AddVariant family={this.props.family}/>
			</Modal>
		);
	}
}
