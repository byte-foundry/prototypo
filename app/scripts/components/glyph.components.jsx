import React from 'react';
import classNames from 'classnames';

import LocalClient from '../stores/local-client.stores.jsx';

export default class Glyph extends React.PureComponent {
	constructor(props) {
		super(props);
		this.selectGlyph = this.selectGlyph.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	selectGlyph() {
		this.client.dispatchAction('/select-glyph', {unicode: this.props.unicode});
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] Glyph');
		}
		const showAlts = Array.isArray(this.props.glyph) && this.props.glyph.length > 1;
		const classes = classNames({
			'glyph-list-glyph': true,
			'is-selected': this.props.selected,
			'is-commented': false,
			'is-read': false,
			'is-parametrized': false,
			'has-alts': showAlts,
			'is-manually-modified': this.props.manualEdited,
		});

		return (
			<div className={classes} onClick={this.selectGlyph}>
				<label className="glyph-list-glyph-label">{String.fromCharCode(this.props.unicode)}</label>
				<div className="glyph-list-glyph-top-right-indicator" />
				<div className="glyph-list-glyph-top-left-indicator" />
				<div className="glyph-list-glyph-bottom-left-indicator" />
				<div className="glyph-list-glyph-bottom-right-indicator" />
			</div>
		);
	}
}
