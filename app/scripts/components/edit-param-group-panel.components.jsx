import React from 'react';
import Lifespan from 'lifespan';

import LocalClient from '../stores/local-client.stores.jsx';

export default class EditParamGroupPanel extends React.Component {
	componentWillMount() {
		this.client = LocalClient.instance();
	}

	toggleGlyphs(e) {
		e.preventDefault();
		this.client.dispatchAction('/toggle-glyph-param-grid');
	}

	removeGlyph(glyph) {
		this.client.dispatchAction('/remove-glyph',{glyph});
	}

	saveGroup() {
		this.client.dispatchAction('/save-param-group', {name: React.findDOMNode(this.refs.name).value });
	}

	render() {

		const glyphs = _.map(this.props.glyphs, (glyph) => {
			return <div key={glyph} onClick={() => { this.removeGlyph(glyph)}} className="delete-param-group-glyph">{String.fromCharCode(glyph)}</div>
		});

		const error = this.props.errorEdit ? (
			<div className="create-param-group-panel-error">
				<span className="create-param-group-panel-error-message">{this.props.errorEdit}</span>
			</div>
		) : false;

		return (
			<div className="edit-param-group-panel">
				Editing group
				<input type="text" ref="name" className="edit-param-group-panel-input" defaultValue={this.props.groupName}></input>
				<p>
					Glyphs in this group
				</p>
				<div className="delete-param-group-glyphs">
					{glyphs}
				</div>
				<button className="create-param-group-form-add-glyph" onClick={(e) => { this.toggleGlyphs(e) }}>Add multiple glyph to this group</button>
				{error}
				<div className="create-param-group-form-buttons">
					<button className="create-param-group-form-buttons-cancel" onClick={() => {this.client.dispatchAction('/edit-param-group', false)}}>Cancel</button>
					<button className="create-param-group-form-buttons-submit" onClick={() => {this.saveGroup()}}>Save</button>
				</div>
			</div>
		)
	}
}
