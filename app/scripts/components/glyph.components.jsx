import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import ClassNames from 'classnames';
import AlternateGlyphList from './alternate-glyph-list.components.jsx';

export default class Glyph extends React.Component {

	selectGlyph() {
		const client = LocalClient.instance();

		client.dispatchAction('/select-glyph',{unicode:this.props.unicode});
	}

	render() {
		const showAlts = Array.isArray(this.props.glyph) && this.props.glyph.length > 1;
		const glyph = showAlts ? this.props.glyph[0] : this.props.glyph;

		const classes = ClassNames({
			"glyph-list-glyph":true,
			"is-selected": this.props.selected,
			"is-commented": false,
			"is-read": false,
			"is-manually-modified":false,
			"is-parametrized": false,
		});

		const alts = showAlts ? <AlternateGlyphList alts={_.without(this.props.glyph,this.props.glyph[0])} unicode={this.props.unicode}/> : undefined;

		return (
			<div className={classes} onClick={() => { this.selectGlyph() } }>
				<label className="glyph-list-glyph-label">{String.fromCharCode(this.props.unicode)}</label>
				<div className="glyph-list-glyph-right-indicator"></div>
				<div className="glyph-list-glyph-left-indicator"></div>
				{ alts }
			</div>
		)
	}
}
