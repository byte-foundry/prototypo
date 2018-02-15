import React from 'react';
import Lifespan from 'lifespan';
import classNames from 'classnames';

import LocalClient from '../stores/local-client.stores.jsx';
import GlyphList from './glyph-list.components.jsx';

export default class GlyphPanel extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			glyphs: {},
			tags: [],
			tagPinned: [],
			pinnedSearch: [],
			savedSearch: [],
		};
	}

	async componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					show: head.toJS().d.uiMode.indexOf('list') !== -1,
					tagSelected: head.toJS().d.tagSelected,
					tagPinned: head.toJS().d.tagPinned || [],
					tags: head.toJS().d.tags,
					glyphs: head.toJS().d.glyphs,
					glyphSelected: head.toJS().d.glyphSelected,
					search: head.toJS().d.glyphSearch,
					savedSearch: head.toJS().d.savedSearch || [],
					pinnedSearch: head.toJS().d.pinnedSearch || [],
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

		if (this.state.show) {
			const intercom = document.querySelector('#intercom-launcher');

			if (intercom) {
				intercom.style.right = '214px';
			}
		}
		else {
			const intercom = document.querySelector('#intercom-launcher');

			if (intercom) {
				intercom.style.right = '14px';
			}
		}

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
