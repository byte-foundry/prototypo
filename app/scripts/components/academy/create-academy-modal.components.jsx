import React from 'react';
import Modal from '../shared/modal.components.jsx';
import AcademyModal from './academy-modal.components.jsx';

export default class CreateAcademyModal extends React.PureComponent {
	render() {
		return (
			<Modal propName={this.props.propName}>
				<div className="modal-container-content academy-modal">
					<AcademyModal />
				</div>
			</Modal>
		);
	}
}
