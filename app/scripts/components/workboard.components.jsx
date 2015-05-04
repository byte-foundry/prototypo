import React from 'react';
import GlyphPanel from './glyph-panel.components.jsx';

export default class Workboard extends React.Component {
	render() {
		return (
			<div id="workboard">
				<div id="editor-canvas">
				</div>
				<GlyphPanel />
			</div>
		)
	}
}
