import React from 'react';
import Lifespan from 'lifespan';
import ClassNames from 'classnames';

import LocalClient from '../stores/local-client.stores.jsx';

export default class SearchGlyphList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {}
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	search(e) {
		e.preventDefault();
		this.client.dispatchAction('/search-glyph', {
			query: React.findDOMNode(this.refs.search).value
		});
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] SearchGlyphList');
		}

		const classes = ClassNames({
			'search-glyph-list': true
		});

		return (
			<form className={classes} onSubmit={(e) => { this.search(e); }} >
				<input className="search-glyph-list-input" ref="search" placeholder="Search glyph…" type="text"/>
				<input className="search-glyph-list-submit"type="button"/>
			</form>
		)
	}
}
