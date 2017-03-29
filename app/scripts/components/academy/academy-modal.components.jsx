import React from 'react';
import Lifespan from 'lifespan';
import InlineSVG from 'svg-inline-react';
import {academyTutorialLabel} from '../../helpers/joyride.helpers.js';
import Button from '../shared/button.components.jsx';
import LocalClient from '~/stores/local-client.stores.jsx';
import {Link} from 'react-router';

export default class AcademyModal extends React.Component {
	constructor(props) {
		super(props);
		this.showAcademy = this.showAcademy.bind(this);
		this.exit = this.exit.bind(this);
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
		this.client.dispatchAction('/store-value', {
			uiJoyrideTutorialValue: academyTutorialLabel,
			topbarItemDisplayed: 4,
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
				<div onClick={this.showAcademy}><InlineSVG className="academy-modal-icon" element="div" src={require('!svg-inline?classPrefix=modal-!../../../images/academy/medal.svg')} /></div>
				<p>Hey there! <br/>
				Do you want to learn how to use Prototypo?<br/><br/>
				Don't worry, we've set up a serie of courses just for you.</p>
				<br/>
				<div className="action-form-buttons">
					<Button click={this.exit} label="No thanks, I know what I'm doing" neutral={true}/>
					<Button click={this.showAcademy} label="Sure, let's go ahead!"/>
				</div>
			</div>
		);
	}
}
