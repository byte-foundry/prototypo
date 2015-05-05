import React from 'react';
import Topbar from './topbar.components.jsx';
import GlyphPanel from './glyph-panel.components.jsx';

export default class Workboard extends React.Component {
	render() {
		return (
			<div id="workboard">
				<Topbar />
				<div id="editor-canvas">
				</div>
				<GlyphPanel />
			</div>
		)
	}
}
