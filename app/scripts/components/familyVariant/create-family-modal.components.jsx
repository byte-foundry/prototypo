import React from 'react';

import Log from '../../services/log.services.js';
import LocalClient from '../../stores/local-client.stores.jsx';

import Modal from '../shared/modal.components';
import {AddFamily} from './add-family-variant.components';

export default class CreateFamilyModal extends React.PureComponent {
	constructor(props) {
		super(props);

		this.handleCreateFamily = this.handleCreateFamily.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	handleCreateFamily(family) {
		Log.ui('Collection.CreateFamily'); // this is wrong since it's also in the top bar
		this.client.dispatchAction('/select-variant', {variant: family.variants[0], family});
		this.client.dispatchAction('/store-value', {uiShowCollection: false});
		this.props.router.push('/onboarding');
	}

	render() {
		return (
			<Modal propName={this.props.propName}>
				<div className="modal-container-content">
					<h1>Create new family</h1>
					<AddFamily onCreateFamily={this.handleCreateFamily} />
				</div>
			</Modal>
		);
	}
}
