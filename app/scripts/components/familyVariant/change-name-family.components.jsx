import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import LocalClient from '~/stores/local-client.stores.jsx';
import Lifespan from 'lifespan';

import Modal from '../shared/modal.components.jsx';
import InputWithLabel from '../shared/input-with-label.components.jsx';
import Button from '../shared/button.components.jsx';

export default class ChangeNameFamily extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			errorFamilyNameChange: undefined,
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

		// function binding to avoid unnecessary re-render
		this.exit = this.exit.bind(this);
		this.editFamily = this.editFamily.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					errorFamilyNameChange: head.toJS().errorFamilyNameChange,
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
			openChangeFamilyNameModal: false,
			errorFamilyNameChange: undefined,
		});
	}

	editFamily() {
		this.client.dispatchAction('/edit-family-name', {
			family: this.props.family,
			newName: this.refs.newName.inputValue,
		});
	}

	render() {
		const error = this.state.errorFamilyNameChange
			? <div className="add-family-form-error">{this.state.errorFamilyNameChange.toString()}</div>
			: false;

		return (
			<Modal propName={this.props.propName}>
				<div className="modal-container-title account-header">Change family name</div>
				<div className="modal-container-content">
					<InputWithLabel ref="newName" inputValue={this.props.family.name}/>
					{error}
					<div className="action-form-buttons">
						<Button click={this.exit} label="Cancel" neutral={true}/>
						<Button click={this.editFamily} label="Change family name"/>
					</div>
				</div>
			</Modal>
		);
	}
}
