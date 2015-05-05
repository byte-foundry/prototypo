import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';

export default class Glyph extends React.Component {
	render() {
		return (
			<div className="glyph-list-glyph">
				<label className="glyph-list-glyph-label">{this.props.glyph.name}</label>
			</div>
		)
	}
}
