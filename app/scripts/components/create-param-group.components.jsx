import React from 'react';
import Lifespan from 'lifespan';
import ReactGeminiScrollbar from 'react-gemini-scrollbar';
import Classnames from 'classnames';

import LocalClient from '../stores/local-client.stores.jsx';

export default class CreateParamGroup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: [],
		};
	}
	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/individualizeStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					grid: head.toJS().glyphGrid,
					selected: head.toJS().selected,
					tagSelected: head.toJS().tagSelected,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client.getStore('/tagStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					tags: head.toJS().tags,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	createGroup(e) {
		e.preventDefault();

		this.client.dispatchAction('/create-param-group', {
			name: this.state.groupName,
			selected: this.state.selected,
		});
	}

	toggleGlyphs() {
		this.client.dispatchAction('/toggle-glyph-param-grid');
	}

	handleGroupNameChange(e) {
		this.setState({
			groupName: e.target.value,
		});
	}

	render() {
		const glyphGrid = this.state.grid ? (
			<GlyphGrid 
				tagSelected={this.state.tagSelected}
				selected={this.state.selected} 
				tags={this.state.tags}/> 
		) : false;

		return (
			<div className="create-param-group">
				<div className="create-param-group-ribbon">
					Glyph's parameters settings
				</div>
				<div className="create-param-group-panel">
					<div className="create-param-group-form">
						<form onSubmit={(e) => { this.createGroup(e) }}>
							Create an independant glyph or choose a parameter group
							<input type="text" className="create-param-group-form-input" placeholder="New parameter group" onChange={(e) => { this.handleGroupNameChange(e)}}></input>
							<button className="create-param-group-form-add-glyph" onClick={() => { this.toggleGlyphs() }}>Add multiple glyph to this group</button>
							<div className="create-param-group-form-buttons">
								<button className="create-param-group-form-buttons-cancel">Cancel</button>
								<button className="create-param-group-form-buttons-submit" type="submit">Create</button>
							</div>
						</form>
					</div>
					{glyphGrid}
				</div>
			</div>
		)
	}
}

class GlyphGrid extends React.Component {
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

	selectGlyph(unicode, isSelected) {
		this.client.dispatchAction('/add-glyph-to-indiv',{unicode, isSelected});
	}

	selectTag(e) {
		this.client.dispatchAction('/select-indiv-tag', e.target.value);
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
