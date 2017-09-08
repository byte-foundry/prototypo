import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import Modal from '../shared/modal.components.jsx';
import {AddStep} from './add-step-choice.components.jsx';

export default class CreateStepModal extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		return (
			<Modal propName={this.props.propName}>
				<div className="modal-container-content">
					<h1>{this.props.edit ? 'Edit step' : 'Add step'}</h1>
					<AddStep edit={this.props.edit} variant={this.props.variant} preset={this.props.preset}/>
				</div>
			</Modal>
		);
	}
}
