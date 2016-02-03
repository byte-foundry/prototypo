import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import Classnames from 'classnames';

export default class IndividualizeButton extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();


		this.client.getStore('/individualizeStore', this.lifespan)
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
			'individualize-button-label': true,
			'is-active': this.state.individualize,
		});

		return (
			<div className="canvas-menu-item individualize-button">
				<div className={buttonClass} title="Individualize parameters" onClick={() => { this.individualize(); }} ></div>
			</div>
		);
	}
}
