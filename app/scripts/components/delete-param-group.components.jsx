import React from 'react';

export default class DeleteParamGroup extends React.Component {
	render() {
		const glyphs = _.map(this.props.glyphs, (glyph) => {
			return <div>{String.fromCharCode(glyph)}</div>
		});

		return (
			<div className="delete-param-group">
				<p className="delete-param-group-question">
					Are you sure you want to delete the param group {this.props.groupName}
				</p>
				<p>
					Glyphs in this group
				</p>
				{glyphs}
			</div>
		)
	}
}
