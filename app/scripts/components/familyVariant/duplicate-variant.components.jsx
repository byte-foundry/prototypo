import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import LocalClient from '~/stores/local-client.stores.jsx';

import Modal from '../shared/modal.components.jsx';
import InputWithLabel from '../shared/input-with-label.components.jsx';
import Button from '../shared/button.components.jsx';

export default class DuplicateVariant extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
		this.exit = this.exit.bind(this);
		this.duplicateVariant = this.duplicateVariant.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	exit() {
		this.client.dispatchAction('/store-value', {openDuplicateVariantModal: false});
	}

	duplicateVariant() {
		this.client.dispatchAction('/create-variant', {
			familyName: this.props.family.name,
			name: this.refs.newName.inputValue,
			variantBase: this.props.variant,
			noSwitch: true,
		});
	}

	render() {
		return (
			<Modal>
				<div className="modal-container-title">Duplicate variant {this.props.variant.name}</div>
				<InputWithLabel ref="newName"/>
				<div className="add-family-form-buttons">
					<Button click={this.exit} label="Cancel" neutral={true}/>
					<Button click={this.duplicateVariant} label={`Duplicate ${this.props.variant.name}`}/>
				</div>
			</Modal>
		);
	}
}
