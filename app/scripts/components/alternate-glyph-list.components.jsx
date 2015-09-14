import React from 'react';
import Glyph from './glyph.components.jsx';

export default class AlternateGlyphList extends React.Component {

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] alternateGlyphList');
		}
		return (
			<div className="alternate-glyph-list">
				{
					_.map(this.props.alts, (glyph,i) => {
						return <Glyph glyph={glyph} unicode={this.props.unicode} key={`alt-${this.props.unicode}-${i}`} />
					})
				}
			</div>
		)
	}
}
