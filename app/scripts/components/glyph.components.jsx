import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';

export default class Glyph extends React.Component {
	componentWillMount() {
		this.client = new LocalClient().instance;

		this.changeTab = () => {
			this.client.dispatchAction('/go-back');
		};
	}
	render() {
		return (
			<div className="glyph-list-glyph" onClick={this.changeTab}>
				<label className="glyph-list-glyph-label">{this.props.glyph.name}</label>
			</div>
		)
	}
}
