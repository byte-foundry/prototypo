import React from 'react';
import Classnames from 'classnames';

import LocalClient from '../stores/local-client.stores.jsx';

export default class SearchGlyphList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	changeSearch() {
		this.client.dispatchAction('/search-glyph', {
			query: React.findDOMNode(this.refs.search).value,
		});
	}

	saveSearch() {
		this.client.dispatchAction('/save-search-glyph', {
			query: React.findDOMNode(this.refs.search).value,
		});
		React.findDOMNode(this.refs.search).value = '';
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] SearchGlyphList');
		}

		const classes = Classnames({
			'search-glyph-list': true,
		});

		return (
			<form className={classes}>
				<input className="search-glyph-list-input" ref="search" placeholder="Search glyph…" type="text" onChange={() => { this.changeSearch(); }}/>
				<input className="search-glyph-list-submit" type="button" onClick={() => { this.saveSearch();}}/>
			</form>
		);
	}
}
