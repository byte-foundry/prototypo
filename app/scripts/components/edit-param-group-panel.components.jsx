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

	render() {

		const glyphs = _.map(this.props.glyphs, (glyph) => {
			return <div onClick={() => { this.removeGlyph(glyph)}} className="delete-param-group-glyph">{String.fromCharCode(glyph)}</div>
		});

		return (
			<div className="edit-param-group-panel">
				Editing group
				<input type="text" className="edit-param-group-panel-input" defaultValue={this.props.groupName}></input>
				<p>
					Glyphs in this group
				</p>
				<div className="delete-param-group-glyphs">
					{glyphs}
				</div>
				<button className="create-param-group-form-add-glyph" onClick={(e) => { this.toggleGlyphs(e) }}>Add multiple glyph to this group</button>
				<div className="create-param-group-form-buttons">
					<button className="create-param-group-form-buttons-cancel"  onClick={() => {this.client.dispatchAction('/edit-param-group', true)}}>Cancel</button>
					<button className="create-param-group-form-buttons-submit" type="submit">Save</button>
				</div>
			</div>
		)
	}
}
