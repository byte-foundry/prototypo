import React from 'react';
import Lifespan from 'lifespan';
import ScrollArea from 'react-scrollbar/dist/no-css';
import classNames from 'classnames';

import LocalClient from '../stores/local-client.stores.jsx';

export default class GlyphGrid extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			glyphs: {},
		};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					glyphs: head.toJS().d.glyphs,
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
		const glyphs = this.state.glyphs.map((glyph, unicode) => {
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

		const tags = this.props.tags.map(tag => <option value={tag} key={tag}>{tag}</option>);

		return (
			<div className="glyphs-grid">
				<div className="glyphs-grid-header">
					<div className="glyphs-grid-header-title">
						Add glyphs
					</div>
					<div className="glyphs-grid-filter">
						Filter by:
						<select className="glyphs-grid-filter-select" onChange={(e) => {this.selectTag(e);}}>
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
