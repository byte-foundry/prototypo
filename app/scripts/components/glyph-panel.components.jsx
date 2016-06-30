import React from 'react';
import GlyphList from './glyph-list.components.jsx';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import {BatchUpdate} from '../helpers/undo-stack.helpers.js';

import classNames from 'classnames';

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

		const glyphs = await this.client.fetch('/glyphs');

		this.undoWatcher = new BatchUpdate(glyphs,
			'/glyphs',
			this.client,
			this.lifespan,
			(name) => {
				return `selectioner ${name}`;
			},
			() => {
				return true;
				//TODO(franz): Here we shall save stuff to hoodie
			});
		this.client.getStore('/panel', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					show: head.toJS().mode.indexOf('list') !== -1,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client.getStore('/glyphs', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					glyphs: head.toJS(),
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client.getStore('/tagStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					tags: head.toJS(),
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client.getStore('/searchStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					search: head.toJS().glyphSearch,
					savedSearch: head.toJS().savedSearch,
					pinnedSearch: head.toJS().pinned,
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

		const classes = classNames({
			'is-locked': this.state.glyphs.locked,
			'is-active': this.state.show,
		});

		return (
			<div id="glyphpanel" className={classes}>
				<GlyphList
					tags={this.state.tags.tags}
					pinned={this.state.tags.pinned}
					glyphs={this.state.glyphs.glyphs}
					selected={this.state.glyphs.selected}
					selectedTag={this.state.tags.selected}
					search={this.state.search}
					savedSearch={this.state.savedSearch}
					pinnedSearch={this.state.pinnedSearch}/>
			</div>
		);
	}
}
