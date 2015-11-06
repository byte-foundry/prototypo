import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';

export default class CanvasGlyphInput extends React.Component {
	render() {

		return (
			<div className="canvas-menu-item canvas-glyph-input">
				<div className="canvas-glyph-input-label is-active">Glyph List</div>
				<div className="canvas-glyph-input-input">A</div>
			</div>
		)
	}
}
