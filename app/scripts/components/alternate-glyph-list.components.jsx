import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import Glyph from './glyph.components.jsx';
import LocalClient from '../stores/local-client.stores.jsx';

export default class AlternateGlyphList extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	alternate(unicode, glyphName) {
		this.client.dispatchAction('/set-alternate', {unicode, glyphName});
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] alternateGlyphList');
		}
		return (
			<div className="alternate-glyph-list">
				{
					_.map(this.props.alts, (glyph, i) => {
						return (
							<div onClick={() => { this.alternate(this.props.unicode, glyph.name);}}>
								<Glyph glyph={glyph} unicode={this.props.unicode} key={`alt-${this.props.unicode}-${i}`}/>
							</div>
						);
					})
				}
			</div>
		);
	}
}
