import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import Modal from '../shared/modal.components.jsx';
import {ChangeFamilyName} from './add-family-variant.components.jsx';
import InputWithLabel from '../shared/input-with-label.components.jsx';

export default class ChangeNameFamily extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		return (
			<Modal>
				<div className="modal-container-title">Change family name</div>
				<InputWithLabel />
			</Modal>
		);
	}
}
