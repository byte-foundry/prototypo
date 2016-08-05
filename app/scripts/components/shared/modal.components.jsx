import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import LocalClient from '~/stores/local-client.stores.jsx';

export default class Modal extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
		this.onBackdropClick = this.onBackdropClick.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	onBackdropClick(e) {
		if(e.target !== this.refs.backdrop) {
			return;
		}

		this.client.dispatchAction('/store-value', {[this.props.propName]: false});
	}

	render() {
		return (
			<div className="modal" onClick={this.onBackdropClick} ref="backdrop">
				<div className="modal-container">
					{this.props.children}
				</div>
			</div>
		);
	}
}
