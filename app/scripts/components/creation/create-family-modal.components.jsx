import React from 'react';

import Modal from '../shared/modal.components.jsx';
import {AddFamily} from '../family.components.jsx';

export default class CreateFamilyModal extends React.Component {
	render() {
		return (
			<Modal>
				<div className="modal-container-title">CREATE NEW FAMILY</div>
				<AddFamily />
			</Modal>
		);
	}
}
