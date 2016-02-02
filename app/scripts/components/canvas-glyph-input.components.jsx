import React from 'react';
import Lifespan from 'lifespan';

import Log from '../services/log.services.js';

import LocalClient from '../stores/local-client.stores.jsx';

export default class CanvasGlyphInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			panel: {
				mode: [],
			},
		};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/panel', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					panel: head.toJS(),
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	toggleView(name) {
		const newViewMode = _.xor(this.state.panel.mode, [name]);

		if (newViewMode.length > 0) {
			this.client.dispatchAction('/store-panel-param', {mode: newViewMode});
			Log.ui('Canvas.toggleView', name);
		}
	}

	render() {
		return (
			<div className="canvas-menu-item canvas-glyph-input">
				<div className="canvas-glyph-input-label is-active" onClick={() => { this.toggleView('list'); }} >Glyphs List</div>
				<div className="canvas-glyph-input-input">A</div>
			</div>
		);
	}
}
