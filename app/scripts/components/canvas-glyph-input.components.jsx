import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';

export default class CanvasGlyphInput extends React.Component {

	toggleView(name) {
		console.log('here');
		const newViewMode = _.xor(this.state.panel.mode,[name]);
		if (newViewMode.length > 0) {
			this.client.dispatchAction('/store-panel-param',{mode:newViewMode});
			Log.ui('Topbar.toggleView', name);
		}
	}

	render() {

		return (
			<div className="canvas-menu-item canvas-glyph-input">
				<div className="canvas-glyph-input-label is-active" onClick={(e) => { this.toggleView('list') }} >Glyphs List</div>
				<div className="canvas-glyph-input-input">A</div>
			</div>
		)
	}
}
