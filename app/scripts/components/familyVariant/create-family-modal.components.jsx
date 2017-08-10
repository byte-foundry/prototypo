import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import Modal from '../shared/modal.components.jsx';
import {AddFamily} from './add-family-variant.components.jsx';

export default class CreateFamilyModal extends React.PureComponent {
	constructor(props) {
		super(props);

		this.handleCreateFont = this.handleCreateFont.bind(this);
	}

	handleCreateFont(family) {

	}

	render() {
		return (
			<Modal propName={this.props.propName}>
				<div className="modal-container-content">
					<h1>Create new family</h1>
					<AddFamily onCreateFont={this.handleCreateFont} />
				</div>
			</Modal>
		);
	}
}
