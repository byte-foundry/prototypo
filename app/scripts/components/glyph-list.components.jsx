import React from 'react';
import Glyph from './glyph.components.jsx';
import Remutable from 'remutable';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import {BatchUpdate} from '../helpers/undo-stack.helpers.js';

export default class GlyphList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			glyphs: undefined,
		};
	}

	async componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = new LocalClient().instance;
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
				this.setState(head.toJS());
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		const selectedGlyph = this.state.selected;
		return (
			<div className="glyph-list clearfix">
				{
					_.map(this.state.glyphs, (glyph, unicode) => {
						if (selectedGlyph == unicode)
							return (<Glyph glyph={glyph} selected={true} unicode={unicode} key={unicode} />);
						else
							return (<Glyph glyph={glyph} selected={false} unicode={unicode} key={unicode} />);

					})
				}
			</div>
		)
	}
}
