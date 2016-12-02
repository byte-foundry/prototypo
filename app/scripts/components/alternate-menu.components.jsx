import React from 'react';

import LocalClient from '../stores/local-client.stores.jsx';

export default class AlternateMenu extends React.PureComponent {
	render() {
		const alternates = this.props.alternates.map((alt, index) => {
			return <Alternate id={index} alt={alt} key={index} unicode={this.props.unicode}/>;
		});

		return (
			<div className="canvas-menu-item alternate-menu">
				<div className="alternate-menu-list">
					{alternates}
				</div>
				<div className="alternate-menu-label">Alternates</div>
			</div>
		);
	}
}

class Alternate extends React.PureComponent {
	constructor(props) {
		super(props);

		this.selectAlternate = this.selectAlternate.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	selectAlternate() {
		this.client.dispatchAction('/set-alternate', {unicode: this.props.unicode, glyphName: this.props.alt.name, relatedGlyphs: this.props.alt.src.relatedGlyphs});
	}

	render() {
		return (
			<div className="alternate" onClick={this.selectAlternate}>
				<img src={this.props.alt.altImg} />
			</div>
		);
	}
}
