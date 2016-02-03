import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import Classnames from 'classnames';

export default class Glyph extends React.Component {

	selectGlyph() {
		const client = LocalClient.instance();

		client.dispatchAction('/select-glyph', {unicode: this.props.unicode});
	}

	shouldComponentUpdate(newProps) {
		return (
			this.props.glyph !== newProps.glyph
			|| this.props.selected !== newProps.selected
		);
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] Glyph');
		}
		const showAlts = Array.isArray(this.props.glyph) && this.props.glyph.length > 1;
		const classes = Classnames({
			"glyph-list-glyph": true,
			"is-selected": this.props.selected,
			"is-commented": false,
			"is-read": false,
			"is-manually-modified": false,
			"is-parametrized": false,
			"has-alts": showAlts,
		});

		return (
			<div className={classes} onClick={() => { this.selectGlyph(); } }>
				<label className="glyph-list-glyph-label">{String.fromCharCode(this.props.unicode)}</label>
				<div className="glyph-list-glyph-right-indicator"></div>
				<div className="glyph-list-glyph-left-indicator"></div>
				<div className="glyph-list-glyph-top-indicator"></div>
			</div>
		);
	}
}
