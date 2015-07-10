import React from 'react';
import Glyph from './glyph.components.jsx';

export default class GlyphList extends React.Component {

	shouldComponentUpdate(newProps) {
		if (this.props.selected === newProps.selected &&
			this.props.selectedTag === newProps.selectedTag &&
			this.props.glyphs === newProps.glyphs) {
			return false;
		}
		else {
			return true;
		}
	}

	render() {
		const selectedGlyph = this.props.selected;
		const glyphs = _.pick(this.props.glyphs, (glyph) => {
			if (glyph[0].src) {
				return glyph[0].src.tags.indexOf(this.props.selectedTag) != -1
			}
			else return false;
		});
		return (
			<div className="glyph-list clearfix">
				{
					_.map(glyphs, (glyph, unicode) => {
						if (selectedGlyph == unicode)
							return (<Glyph glyph={glyph} selected={true} unicode={unicode} key={unicode} />);
						else
							return (<Glyph glyph={glyph} selected={false} unicode={unicode} key={unicode} />);

					})
				}
			</div>
		)
	}
}
