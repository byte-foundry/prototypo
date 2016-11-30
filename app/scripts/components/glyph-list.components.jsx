import React from 'react';
import ScrollArea from 'react-scrollbar';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import Lifespan from 'lifespan';

import LocalClient from '../stores/local-client.stores.jsx';

import Glyph from './glyph.components.jsx';
import SearchGlyphList from './search-glyph-list.components.jsx';
import GlyphTagList from './glyph-tag-list.components.jsx';

export default class GlyphList extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/undoableStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					values: head.toJS().controlsValues,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	shouldComponentUpdate(newProps) {
		if (this.props.selected === newProps.selected
			&& this.props.selectedTag === newProps.selectedTag
			&& _.isEqual(this.props.pinned, newProps.pinned).length
			&& this.props.glyphs === newProps.glyphs) {
			return false;
		}
		else {
			return true;
		}
	}

	isManualEdited(glyph){
		const manualChangesGlyph = this.state.values.manualChanges[glyph[0].name];
		return (manualChangesGlyph && Object.keys(manualChangesGlyph.cursors).length > 0) ? true : false;
	}

	isGlyphInSearch(glyph, search) {
		const tokens = search.split(' ');
		const fields = [
			{
				name: 'glyphName',
				comp: (field, srch) => {
					return field.indexOf(srch) !== -1;
				},
			},
			{
				name: 'unicode',
				comp: (field, srch) => {
					return field.indexOf(srch) !== -1;
				},
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
				tokenOk = tokenOk
				|| (
					glyph[0].src[field.name]
						&& field.comp(
							glyph[0].src[field.name].toString().toLowerCase(),
							token.toLowerCase()
						)
				);
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
		const glyphs = _.pickBy(this.props.glyphs, (glyph) => {
			if (glyph[0].src) {
				return (
					glyph[0].src.tags.indexOf(this.props.selectedTag) !== -1
					&& (
						!this.props.search || this.isGlyphInSearch(glyph, this.props.search)
					)
				);
			}
			else {
				return false;
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
					pinnedSearch={this.props.pinnedSearch}/>
				<ScrollArea horizontal={false}>
					<div className="glyph-list-glyphs">
						{
							_.map(glyphs, (glyph, unicode) => {
								if (selectedGlyph === unicode) {
									return (<Glyph glyph={glyph} selected={true} unicode={unicode} key={unicode} manualEdited={this.isManualEdited(glyph)} />);
								}
								else {
									return (<Glyph glyph={glyph} selected={false} unicode={unicode} key={unicode} manualEdited={this.isManualEdited(glyph)} />);
								}

							})
						}
					</div>
				</ScrollArea>
				<SearchGlyphList/>
			</div>
		);
	}
}
