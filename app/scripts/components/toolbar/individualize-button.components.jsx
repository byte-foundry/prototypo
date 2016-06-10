import React from 'react';
import Lifespan from 'lifespan';
import Classnames from 'classnames';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import LocalClient from '../../stores/local-client.stores.jsx';

export default class IndividualizeButton extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();


		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					individualize: head.toJS().indivMode,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	individualize() {
		this.client.dispatchAction('/toggle-individualize');
	}

	render() {

		const buttonClass = Classnames({
			'individualize-button-switch': true,
			'is-active': this.state.individualize,
		});

		return (
			<div className="individualize-button" onClick={() => { this.individualize(); }} >
				<div className="individualize-button-label">All glyphs</div>
				<div className={buttonClass} onClick={() => { this.individualize(); }} >
					<div className="individualize-button-switch-toggle" title="Individualize parameters"></div>
				</div>
				<div className="individualize-button-label">Groups of glyphs</div>
			</div>
		);
	}
}
