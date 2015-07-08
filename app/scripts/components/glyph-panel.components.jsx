import React from 'react';
import GlyphButton from './glyph-button.components.jsx';
import GlyphList from './glyph-list.components.jsx';

export default class GlyphPanel extends React.Component {
	render() {
		return (
			<div id="glyphpanel">
				<GlyphButton />
				<GlyphList />
			</div>
		)
	}
}
