import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import LocalClient from '../stores/local-client.stores.jsx';

export default class AlternateMenu extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {

		const alternates = _.map(this.props.alternates, (alt, index) => {
			return <Alternate id={index} key={index} alt={alt} unicode={this.props.unicode}/>;
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

class Alternate extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	selectAlternate() {
		this.client.dispatchAction('/set-alternate', {unicode: this.props.unicode, glyphName: this.props.alt.name});
	}

	render() {
		return (
			<div className="alternate" onClick={() => {this.selectAlternate();}}>
				<img src={`assets/images/${this.props.alt.altImg}`}/>
			</div>
		);
	}
}
