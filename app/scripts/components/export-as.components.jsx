import React from 'react';

import LocalClient from '../stores/local-client.stores.jsx';

import InputWithLabel from './shared/input-with-label.components.jsx';

export default class ExportAs extends React.Component {
	componentWillMount() {
		this.client = LocalClient.instance();
	}

	exportAs() {
		const data = this.refs.modal.getValues();

		this.client.dispatchAction('/export-otf', {
			merged: true,
			familyName: data.familyName,
			variantName: data.variantName,
			exportAs: true,
		});

		this.client.dispatchAction('/set-up-export-otf', {exportAs: false});
	}

	render() {
		return (
			<div className="export-as">
				<Modal ref="modal" click={this.exportAs.bind(this)}/>
			</div>
		);
	}
}

class Modal extends React.Component {
	getValues() {
		return {
			familyName: this.refs.family.inputValue,
			variantName: this.refs.variant.inputValue,
		};
	}
	render() {
		return (
			<div className="export-as-modal">
				<h1 className="export-as-modal-title">Export font as...</h1>
				<div className="export-as-modal-content">
					<InputWithLabel label="Family name" ref="family"/>
					<InputWithLabel label="Variant name" ref="variant"/>
				</div>
				<button className="export-as-modal-button" onClick={this.props.click}>Export</button>
			</div>
		)
	}
}
