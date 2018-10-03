import React from 'react';

import LocalClient from '../../stores/local-client.stores.jsx';
import Log from '../../services/log.services.js';

export default class Modal extends React.PureComponent {
	constructor(props) {
		super(props);

		this.onBackdropClick = this.onBackdropClick.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	onBackdropClick(e) {
		if (e.target !== this.refs.backdrop) {
			return;
		}

		this.client.dispatchAction('/store-value', {[this.props.propName]: false});
		window.Intercom('trackEvent', `close${this.props.propName}`);
		Log.ui(`${this.props.propName}.close`);
	}

	render() {
		return (
			<div className="modal" onClick={this.onBackdropClick} ref="backdrop">
				<div className="modal-container">{this.props.children}</div>
			</div>
		);
	}
}
