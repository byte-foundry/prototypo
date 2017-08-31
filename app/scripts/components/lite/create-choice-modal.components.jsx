import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import Modal from '../shared/modal.components.jsx';
import {AddChoice} from './add-step-choice.components.jsx';

export default class CreateChoiceModal extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		return (
			<Modal propName={this.props.propName}>
				<div className="modal-container-content">
					<h1>{this.props.edit ? 'Edit choice' : 'Add choice'}</h1>
					<AddChoice step={this.props.step} edit={this.props.edit} />
				</div>
			</Modal>
		);
	}
}
