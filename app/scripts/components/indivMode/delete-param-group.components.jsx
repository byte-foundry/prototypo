import React from 'react';

import LocalClient from '../stores/local-client.stores.jsx';

export default class DeleteParamGroup extends React.Component {
	constructor(props) {
		super(props);

		// function binding
		this.cancelDelete = this.cancelDelete.bind(this);
		this.deleteGroup = this.deleteGroup.bind(this);
	}
	componentWillMount() {
		this.client = LocalClient.instance();
	}

	cancelDelete() {
		this.client.dispatchAction('/pre-delete', false);
	}

	deleteGroup() {
		this.client.dispatchAction('/delete-param-group', {name: this.props.groupName});
	}

	render() {
		const glyphs = _.map(this.props.glyphs, (glyph) => {
			return <div className="delete-param-group-glyph">{String.fromCharCode(glyph)}</div>;
		});

		return (
			<div className="delete-param-group">
				<p className="delete-param-group-question">
					Are you sure you want to delete the param group {this.props.groupName}
				</p>
				<p>
					Glyphs in this group
				</p>
				<div className="delete-param-group-glyphs">
					{glyphs}
				</div>
				<div className="create-param-group-form-buttons">
					<button className="create-param-group-form-buttons-cancel" onClick={this.cancelDelete}>Cancel</button>
					<button className="create-param-group-form-buttons-submit" onClick={this.deleteGroup}>Delete</button>
				</div>
			</div>
		);
	}
}
