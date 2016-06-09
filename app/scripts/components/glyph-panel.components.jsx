import React from 'react';
import GlyphList from './glyph-list.components.jsx';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import {BatchUpdate} from '../helpers/undo-stack.helpers.js';

import Classnames from 'classnames';

export default class GlyphPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			glyphs: {},
			tags: {},
		};
	}

	async componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();

		//TODO(franz): this should go to in undoableStore
		/*this.undoWatcher = new BatchUpdate(glyphs,
			'/prot',
			this.client,
			this.lifespan,
			(name) => {
				return `selectioner ${name}`;
			},
			() => {
				return true;
				});*/
		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					show: head.toJS().uiMode.indexOf('list') !== -1,
					tagSelected: head.toJS().tagSelected,
					tagPinned: head.toJS().tagPinned,
					tags: head.toJS().tags,
					glyphs: head.toJS().glyphs,
					glyphSelected: head.toJS().glyphSelected,
					search: head.toJS().glyphSearch,
					savedSearch: head.toJS().savedSearch,
					pinnedSearch: head.toJS().pinnedSearch,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] GlyphPanel');
		}

		const classes = Classnames({
			'is-locked': this.state.glyphs.locked,
			'is-active': this.state.show,
		});

		return (
			<div id="glyphpanel" className={classes}>
				<GlyphList
					tags={this.state.tags}
					pinned={this.state.tagPinned}
					glyphs={this.state.glyphs}
					selected={this.state.glyphSelected}
					selectedTag={this.state.tagSelected}
					search={this.state.search}
					savedSearch={this.state.savedSearch}
					pinnedSearch={this.state.pinnedSearch}/>
			</div>
		);
	}
}
