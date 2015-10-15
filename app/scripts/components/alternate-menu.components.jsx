import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';

export default class AlternateMenu extends React.Component {
	render() {

		const alternates = _.map(this.props.alternates, (alt, index) => {
			return <Alternate id={index} alt={alt.name} unicode={this.props.unicode}/>
		});
		return (
			<div className="alternate-menu">
				<div className="alternate-menu-list">
					{alternates}
				</div>
				<div className="alternate-menu-label">Alts</div>
			</div>
		)
	}
}

class Alternate extends React.Component {

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	selectAlternate() {
		this.client.dispatchAction('/set-alternate',{unicode: this.props.unicode, glyphName: this.props.alt});
	}
	render() {
		return (
			<div className="alternate" onClick={() => {this.selectAlternate()}}>{this.props.id}</div>
		)
	}
}
