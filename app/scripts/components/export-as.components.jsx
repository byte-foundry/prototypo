import React from 'react';

import LocalClient from '../stores/local-client.stores.jsx';

import Modal from './shared/modal.components.jsx';
import InputWithLabel from './shared/input-with-label.components.jsx';
import Button from './shared/button.components.jsx';

export default class ExportAs extends React.Component {
	constructor(props) {
		super(props);

		this.exportAs = this.exportAs.bind(this);
		this.exit = this.exit.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	exit() {
		this.client.dispatchAction('/set-up-export-otf', {exportAs: false});
	}

	exportAs() {
		this.client.dispatchAction('/export-otf', {
			merged: true,
			familyName: this.refs.family.inputValue,
			variantName: this.refs.variant.inputValue,
			exportAs: true,
		});

		this.exit();
	}

	render() {
		return (
			<Modal propName={this.props.propName}>
				<div className="modal-container-title">EXPORT FONT AS...</div>
				<div className="columns">
					<div className="half-column">
						<InputWithLabel label="Family name" ref="family"/>
					</div>
					<div className="half-column">
						<InputWithLabel label="Variant name" ref="variant"/>
					</div>
				</div>
				<div className="add-family-form-buttons">
					<Button click={this.exit} label="Cancel" neutral={true}/>
					<Button click={this.exportAs} label="Export"/>
				</div>
			</Modal>
		);
	}
}
