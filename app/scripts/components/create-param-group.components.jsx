import React from 'react';
import Lifespan from 'lifespan';

import LocalClient from '../stores/local-client.stores.jsx';

import GlyphGrid from './glyph-grid.components.jsx';

export default class CreateParamGroup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: [],
			groups: [],
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
					errorMessage: head.toJS().errorMessage,
					errorGlyphs: head.toJS().errorGlyphs,
					groups: head.toJS().groups,
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

	toggleGlyphs(e) {
		e.preventDefault();
		this.client.dispatchAction('/toggle-glyph-param-grid');
	}

	handleGroupNameChange(e) {
		this.setState({
			groupName: e.target.value,
		});
	}

	cancelIndividualize(e) {
		e.preventDefault();
		this.client.dispatchAction('/cancel-indiv-mode', undefined);
	}

	render() {
		const glyphGrid = this.state.grid ? (
			<GlyphGrid 
				select={(unicode, isSelected) => this.selectGlyph(unicode, isSelected)}
				tagSelected={this.state.tagSelected}
				selected={this.state.selected} 
				tags={this.state.tags}/> 
		) : false;

		const errorGlyphs = _.map(this.state.errorGlyphs, (glyph) => {
			return <div className="create-param-group-panel-error-glyph">{String.fromCharCode(glyph)}</div>
		});

		const error = this.state.errorMessage ? (
			<div className="create-param-group-panel-error">
				<span className="create-param-group-panel-error-message">{this.state.errorMessage}</span>
				<div className="create-param-group-panel-error-glyphs">
					{errorGlyphs}
				</div>
			</div>
		) : false;

		const edit = this.state.groups.length > 0 ? (
			<span className="edit-param-group-button" onClick={() => {this.client.dispatchAction('/edit-mode-param-group')}}>EDIT GROUP</span>
		) : false;

		return (
			<div className="create-param-group">
				<div className="create-param-group-ribbon">
					Glyph's parameters settings
					{edit}
				</div>
				<div className="create-param-group-panel">
					<div className="create-param-group-form">
						<form onSubmit={(e) => { this.createGroup(e) }}>
							Create an independant glyph or choose a parameter group
							<input type="text" className="create-param-group-form-input" placeholder="New parameter group" onChange={(e) => { this.handleGroupNameChange(e)}}></input>
							<button className="create-param-group-form-add-glyph" onClick={(e) => { this.toggleGlyphs(e) }}>Add multiple glyph to this group</button>
							<div className="create-param-group-form-buttons">
								<button className="create-param-group-form-buttons-cancel" onClick={(e) => { this.cancelIndividualize(e) }}>Cancel</button>
								<button className="create-param-group-form-buttons-submit" type="submit">Create</button>
							</div>
							{error}
						</form>
					</div>
					{glyphGrid}
				</div>
			</div>
		)
	}
}

