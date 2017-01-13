import React from 'react';
import Lifespan from 'lifespan';

import {academyTutorialLabel} from '../../helpers/joyride.helpers.js';
import Button from '../shared/button.components.jsx';
import LocalClient from '~/stores/local-client.stores.jsx';

export default class AcademyModal extends React.Component {
	constructor(props) {
		super(props);
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan);
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	static contextTypes = {
		router: React.PropTypes.object.isRequired,
	};

	exit() {
		this.client.dispatchAction('/store-value', {uiJoyrideTutorialValue: academyTutorialLabel});
		this.client.dispatchAction('/store-value', {topbarItemDisplayed: 4});
		this.client.dispatchAction('/store-value', {
			firstTimeAcademyModal: false,
		});
	}

	showAcademy() {
		this.client.dispatchAction('/store-value', {
			firstTimeAcademyModal: false,
		});
		this.context.router.push('/academy');
	}

	render() {

		return (
			<div className="container">
				<p>Coucou</p>
				<div className="action-form-buttons">
					<Button click={(e) => {this.exit(e);} } label="No thanks, I know what I'm doing" neutral={true}/>
					<Button click={(e) => {this.showAcademy(e);} } label="Sure, let's go ahead!"/>
				</div>
			</div>
		);
	}
}
