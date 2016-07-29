import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import Modal from '../shared/modal.components.jsx';
import {AddFamily} from './add-family-variant.components.jsx';

export default class CreateFamilyModal extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		return (
			<Modal>
				<div className="modal-container-title account-header">Create new family</div>
				<div className="modal-container-content">
					<AddFamily />
				</div>
			</Modal>
		);
	}
}
