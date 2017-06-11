import React from 'react';

import LocalClient from '~/stores/local-client.stores.jsx';
import Lifespan from 'lifespan';

import Modal from '../shared/modal.components.jsx';
import InputWithLabel from '../shared/input-with-label.components.jsx';
import Button from '../shared/button.components.jsx';

export default class DuplicateVariant extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			errorAddVariant: undefined,
		};

		this.exit = this.exit.bind(this);
		this.duplicateVariant = this.duplicateVariant.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					errorAddVariant: head.toJS().d.errorAddVariant,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	exit() {
		this.client.dispatchAction('/store-value', {
			openDuplicateVariantModal: false,
			errorAddVariant: undefined,
		});
	}

	duplicateVariant() {
		this.client.dispatchAction('/create-variant', {
			familyName: this.props.family.name,
			familyId: this.props.family.id,
			name: this.refs.newName.inputValue,
			variantBase: this.props.variant,
			noSwitch: true,
		});
	}

	render() {
		const error = this.state.errorAddVariant
			? <div className="add-family-form-error">{this.state.errorAddVariant.toString()}</div>
			: false;

		return (
			<Modal propName={this.props.propName}>
				<div className="modal-container-title account-header">Duplicate variant {this.props.variant.name}</div>
				<div className="modal-container-content">
					<InputWithLabel ref="newName"/>
					{error}
					<div className="action-form-buttons">
						<Button click={this.exit} label="Cancel" neutral={true}/>
						<Button click={this.duplicateVariant} label={`Duplicate ${this.props.variant.name}`}/>
					</div>
				</div>
			</Modal>
		);
	}
}
