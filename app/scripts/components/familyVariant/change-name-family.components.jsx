import React from 'react';

import Modal from '../shared/modal.components.jsx';
import {ChangeFamilyName} from './add-family-variant.components.jsx';
import InputWithLabel from '../shared/input-with-label.components.jsx';

export default class ChangeNameFamily extends React.Component {
	render() {
		return (
			<Modal>
				<div className="modal-container-title">Change family name</div>
				<InputWithLabel />
			</Modal>
		);
	}
}
