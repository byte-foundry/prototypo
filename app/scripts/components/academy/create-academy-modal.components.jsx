import React from 'react';
import Modal from '../shared/modal.components.jsx';
import AcademyModal from './academy-modal.components.jsx';

export default class CreateAcademyModal extends React.PureComponent {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<Modal propName={this.props.propName}>
				<div className="modal-container-title academy">Add variant</div>
				<div className="modal-container-content">
					<AcademyModal/>
				</div>
			</Modal>
		);
	}
}
