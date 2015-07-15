import React from 'react';
import GlyphButton from './glyph-button.components.jsx';
import GlyphList from './glyph-list.components.jsx';
import Remutable from 'remutable';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import {BatchUpdate} from '../helpers/undo-stack.helpers.js';

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
		const server = new LocalServer().instance;

		const glyphs = await this.client.fetch('/glyphs');

		this.undoWatcher = new BatchUpdate(glyphs,
			'/glyphs',
			this.client,
			this.lifespan,
			(name) => {
				return `selectioner ${name}`;
			},
			(headJS) => {
				return true;
				//TODO(franz): Here we shall save stuff to hoodie
			});

		this.client.getStore('/glyphs', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					glyphs:head.toJS(),
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client.getStore('/tagStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					tags:head.toJS(),
				})
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		return (
			<div id="glyphpanel">
				<GlyphButton selected={this.state.tags.selected} pinned={this.state.tags.pinned}/>
				<GlyphList glyphs={this.state.glyphs.glyphs} selected={this.state.glyphs.selected} selectedTag={this.state.tags.selected} tags={this.state.tags.tags}/>
			</div>
		)
	}
}
