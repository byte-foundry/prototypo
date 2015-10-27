import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';

export default class AlternateMenu extends React.Component {
	render() {

		const alternates = _.map(this.props.alternates, (alt, index) => {
			return <Alternate id={index} alt={alt} unicode={this.props.unicode}/>
		});
		return (
			<div className="alternate-menu">
				<div className="alternate-menu-list">
					{alternates}
				</div>
				<div className="alternate-menu-label">Alternates</div>
			</div>
		)
	}
}

class Alternate extends React.Component {

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	selectAlternate() {
		this.client.dispatchAction('/set-alternate',{unicode: this.props.unicode, glyphName: this.props.alt.name});
	}
	render() {
		return (
			<div className="alternate" onClick={() => {this.selectAlternate()}}><img src={`assets/images/${this.props.alt.altImg}`}/></div>
		)
	}
}
