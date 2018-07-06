import _pickBy from 'lodash/pickBy';
import _forOwn from 'lodash/forOwn';
import React from 'react';
import ScrollArea from 'react-scrollbar/dist/no-css';
import Lifespan from 'lifespan';

import LocalClient from '../stores/local-client.stores.jsx';

import Glyph from './glyph.components.jsx';
import SearchGlyphList from './search-glyph-list.components.jsx';
import GlyphTagList from './glyph-tag-list.components.jsx';

export default class GlyphList extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			postDepManualChanges: {},
		};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client
			.getStore('/undoableStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					postDepManualChanges: head.toJS().d.controlsValues
						.postDepManualChanges,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	isManualEdited(glyph) {
		if (this.state.postDepManualChanges) {
			const manualChangesGlyph = this.state.postDepManualChanges[glyph[0].name];

			return (
				manualChangesGlyph && Object.keys(manualChangesGlyph.cursors).length > 0
			);
		}
	}

	isGlyphInSearch(glyph, search) {
		const tokens = search.split(' ');
		const fields = [
			{
				name: 'glyphName',
				comp: (field, srch) => field.indexOf(srch) !== -1,
			},
			{
				name: 'unicode',
				comp: (field, srch) => field.indexOf(srch) !== -1,
			},
			{
				name: 'characterName',
				comp: (field, srch) => {
					let result = false;

					field.split(' ').forEach((fieldToken) => {
						result = result || fieldToken.startsWith(srch);
					});
					return result;
				},
			},
		];
		let isOk = true;

		tokens.forEach((token) => {
			let tokenOk = false;

			fields.forEach((field) => {
				tokenOk
					= tokenOk
					|| (glyph[0][field.name]
						&& field.comp(
							glyph[0][field.name].toString().toLowerCase(),
							token.toLowerCase(),
						));
			});
			isOk = isOk && tokenOk;
		});

		return isOk;
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] GlyphList');
		}
		const selectedGlyph = this.props.selected;
		const glyphs = _pickBy(this.props.glyphs, (glyph) => {
			if (glyph[0].unicode) {
				return (
					glyph[0].tags.indexOf(this.props.selectedTag) !== -1
					&& (!this.props.search || this.isGlyphInSearch(glyph, this.props.search))
				);
			}
			return false;
		});
		const glyphComps = [];

		_forOwn(glyphs, (glyph, unicode) => {
			if (selectedGlyph === unicode) {
				glyphComps.push(
					<Glyph
						glyph={glyph}
						selected={true}
						unicode={unicode}
						key={unicode}
						manualEdited={this.isManualEdited(glyph)}
					/>,
				);
			}
			else {
				glyphComps.push(
					<Glyph
						glyph={glyph}
						selected={false}
						unicode={unicode}
						key={unicode}
						manualEdited={this.isManualEdited(glyph)}
					/>,
				);
			}
		});

		return (
			<div className="glyph-list clearfix">
				<GlyphTagList
					selected={this.props.selectedTag}
					pinned={this.props.pinned}
					tags={this.props.tags}
					savedSearch={this.props.savedSearch}
					selectedSearch={this.props.search}
					pinnedSearch={this.props.pinnedSearch}
				/>
				<ScrollArea horizontal={false}>
					<div className="glyph-list-glyphs">{glyphComps}</div>
				</ScrollArea>
				<SearchGlyphList />
			</div>
		);
	}
}
