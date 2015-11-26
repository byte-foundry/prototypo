import React from 'react';
import Lifespan from 'lifespan';
import ReactGeminiScrollbar from 'react-gemini-scrollbar';
import Classnames from 'classnames';

import LocalClient from '../stores/local-client.stores.jsx';

export default class GlyphGrid extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			glyphs: {},
		};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/glyphs', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					glyphs: head.toJS().glyphs,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}


	selectTag(e) {
		this.client.dispatchAction('/select-indiv-tag', e.target.value);
	}

	selectGlyph(unicode, isSelected) {
		this.client.dispatchAction('/add-glyph-to-indiv',{unicode, isSelected});
	}

	render() {
		const glyphs = _.map(this.state.glyphs, (glyph, unicode) => {
			if (!glyph[0].src) {
				return false;
			}

			if (glyph[0].src.tags.indexOf(this.props.tagSelected) === -1) {
				return false;
			}
			const isSelected = this.props.selected.indexOf(unicode) !== -1

			const classes = Classnames({
				'glyphs-grid-glyph': true,
				'is-active': isSelected,
			});

			return <div className={classes} key={unicode} onClick={() => {this.selectGlyph(unicode, isSelected)}}>{String.fromCharCode(unicode)}</div>
		});

		const tags = _.map(this.props.tags, (tag) => {
			return <option>{tag}</option>
		});

		return (
			<div className="glyphs-grid">
				<div className="glyphs-grid-filter">
					Filter by:
					<select className="glyphs-grid-filter-select" onChange={(e) => { this.selectTag(e)}}>
						{tags}
					</select>
				</div>
				<div className="glyphs-grid-scroll-container">
					<ReactGeminiScrollbar>
						<div className="glyphs-grid-scroll-content">
							{glyphs}
						</div>
					</ReactGeminiScrollbar>
				</div>
			</div>
		)
	}
}
