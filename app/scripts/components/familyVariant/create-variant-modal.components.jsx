import React from 'react';

import Modal from '../shared/modal.components';
import {AddVariant} from './add-family-variant.components';

export default class CreateVariantModal extends React.PureComponent {
	render() {
		const {family, propName} = this.props;

		return (
			<Modal propName={propName}>
				<div className="modal-container-title account-header">Add variant</div>
				<div className="modal-container-content">
					<AddVariant family={family} />
				</div>
			</Modal>
		);
	}
}
