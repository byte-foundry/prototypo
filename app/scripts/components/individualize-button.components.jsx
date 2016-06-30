import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import classNames from 'classnames';

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

		const buttonClass = classNames({
			'individualize-button': true,
			'is-active': this.state.individualize,
		});

		return (
			<div className={buttonClass} onClick={() => { this.individualize(); }} >
				<div className="individualize-button-toggle" title="Individualize parameters"></div>
				<div className="individualize-button-label"></div>
			</div>
		);
	}
}
