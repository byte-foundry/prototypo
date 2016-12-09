import React from 'react';

import Glyph from './glyph.components.jsx';
import LocalClient from '../stores/local-client.stores.jsx';

export default class AlternateGlyphList extends React.PureComponent {
	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] alternateGlyphList');
		}
		return (
			<div className="alternate-glyph-list">
				{
					_.map(this.props.alts, (glyph) => {
						return (
							<AlternateGlyphListItem unicode={this.props.unicode} glyph={glyph}/>
						);
					})
				}
			</div>
		);
	}
}

class AlternateGlyphListItem extends React.PureComponent {
	constructor(props) {
		super(props);
		this.alternate = this.alternate.bind(this);
	}

	alternate() {
		this.client.dispatchAction('/set-alternate', {
			unicode: this.props.unicode,
			glyphName: this.props.name,
		});
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	render() {
		return (
			<div onClick={this.alternate}>
				<Glyph glyph={glyph} unicode={this.props.unicode} key={this.props.name}/>
			</div>
		);
	}
}
