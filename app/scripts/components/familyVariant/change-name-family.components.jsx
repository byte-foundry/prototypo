import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import LocalClient from '~/stores/local-client.stores.jsx';

import Modal from '../shared/modal.components.jsx';
import InputWithLabel from '../shared/input-with-label.components.jsx';
import Button from '../shared/button.components.jsx';

export default class ChangeNameFamily extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	exit() {
		this.client.dispatchAction('/store-value', {openChangeFamilyNameModal: false});
	}

	render() {
		return (
			<Modal>
				<div className="modal-container-title">Change family name</div>
				<InputWithLabel inputValue={this.props.family.name}/>
				<div className="add-family-form-buttons">
					<Button click={(e) => {this.exit(e);} } label="Cancel" neutral={true}/>
					<Button click={(e) => {this.createVariant(e);} } label="Change family name"/>
				</div>
			</Modal>
		);
	}
}
