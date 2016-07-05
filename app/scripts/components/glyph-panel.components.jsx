import React from 'react';
import Lifespan from 'lifespan';
import Classnames from 'classnames';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import LocalClient from '../stores/local-client.stores.jsx';
import {BatchUpdate} from '../helpers/undo-stack.helpers.js';

import GlyphList from './glyph-list.components.jsx';

export default class GlyphPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			glyphs: {},
			tags: {},
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	async componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();

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

		if (this.state.show) {
			const intercom = document.querySelector('#intercom-launcher')
			if (intercom) {
				intercom.style.right = '220px';
			}
		}
		else {
			const intercom = document.querySelector('#intercom-launcher')
			if (intercom) {
				intercom.style.right = '20px';
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
