import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import LocalClient from '~/stores/local-client.stores.jsx';
import Lifespan from 'lifespan';

import Modal from '../shared/modal.components.jsx';
import InputWithLabel from '../shared/input-with-label.components.jsx';
import Button from '../shared/button.components.jsx';

export default class ChangeNameVariant extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			errorVariantNameChange: undefined,
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

		// function binding to avoid unnecessary re-render
		this.exit = this.exit.bind(this);
		this.editVariant = this.editVariant.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					errorVariantNameChange: head.toJS().errorVariantNameChange,
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
			openChangeVariantNameModal: false,
			errorVariantNameChange: undefined,
		});
	}

	editVariant() {
		this.client.dispatchAction('/edit-variant', {
			variant: this.props.variant,
			family: this.props.family,
			newName: this.refs.newName.inputValue,
		});
	}

	render() {
		const error = this.state.errorVariantNameChange
			? <div className="add-family-form-error">{this.state.errorVariantNameChange.toString()}</div>
			: false;

		return (
			<Modal propName={this.props.propName}>
				<div className="modal-container-title account-header">Change variant name</div>
				<div className="modal-container-content">
					<InputWithLabel ref="newName" inputValue={this.props.variant.name}/>
					{error}
					<div className="add-family-form-buttons">
						<Button click={this.exit} label="Cancel" neutral={true}/>
						<Button click={this.editVariant} label="Change variant name"/>
					</div>
				</div>
			</Modal>
		);
	}
}
