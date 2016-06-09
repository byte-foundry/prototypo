import React from 'react';

import Modal from '../shared/modal.components.jsx';
import {AddVariant} from './add-family-variant.components.jsx';

export default class CreateVariantModal extends React.Component {
	render() {
		return (
			<Modal>
				<div className="modal-container-title">Add variant</div>
				<AddVariant family={this.props.family}/>
			</Modal>
		);
	}
}
