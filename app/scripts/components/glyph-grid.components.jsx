import React from 'react';
import Lifespan from 'lifespan';
import ScrollArea from 'react-scrollbar';
import classNames from 'classnames';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import LocalClient from '../stores/local-client.stores.jsx';

export default class GlyphGrid extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			glyphs: {},
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
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

	selectGlyph(unicode, isSelected, isInOtherGroup) {
		if (!isInOtherGroup) {
			this.props.select(unicode, isSelected);
		}
	}

	render() {
		const glyphs = _.map(this.state.glyphs, (glyph, unicode) => {
			if (!glyph[0].src) {
				return false;
			}

			if (glyph[0].src.tags.indexOf(this.props.tagSelected) === -1) {
				return false;
			}

			const isSelected = this.props.selected && this.props.selected.indexOf(unicode) !== -1;
			const forbidden = this.props.forbidden && this.props.forbidden.indexOf(unicode) !== -1;

			const classes = classNames({
				'glyphs-grid-glyph': true,
				'is-active': isSelected,
				'is-disabled': forbidden,
			});

			return <div className={classes} key={unicode} onClick={() => {this.selectGlyph(unicode, isSelected, forbidden);}}>{String.fromCharCode(unicode)}</div>;
		});

		const tags = _.map(this.props.tags, (tag) => {
			return <option value={tag} key={tag}>{tag}</option>;
		});

		return (
			<div className="glyphs-grid">
				<div className="glyphs-grid-header">
					<div className="glyphs-grid-header-title">
						Add glyphs
					</div>
					<div className="glyphs-grid-filter">
						Filter by:
						<select className="glyphs-grid-filter-select" onChange={(e) => { this.selectTag(e);}}>
							{tags}
						</select>
					</div>
				</div>
				<div className="glyphs-grid-scroll-container">
					<ScrollArea horizontal={false}>
						<div className="glyphs-grid-scroll-content">
							{glyphs}
						</div>
					</ScrollArea>
				</div>
			</div>
		);
	}
}
