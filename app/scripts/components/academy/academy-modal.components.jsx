import React from 'react';
import PropTypes from 'prop-types';
import Lifespan from 'lifespan';
import InlineSVG from 'svg-inline-react';
import {Link, withRouter} from 'react-router-dom';

import {academyTutorialLabel} from '../../helpers/joyride.helpers.js';
import Button from '../shared/button.components.jsx';
import LocalClient from '../../stores/local-client.stores.jsx';

class AcademyModal extends React.Component {
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

	exit() {
		this.client.dispatchAction('/store-value', {
			uiJoyrideTutorialValue: academyTutorialLabel,
			topbarItemDisplayed: 4,
			firstTimeAcademyModal: false,
		});
		window.Intercom('trackEvent', 'clicked-no-thanks-on-academy-modal');
	}

	showAcademy() {
		this.client.dispatchAction('/store-value', {
			firstTimeAcademyModal: false,
		});
		window.Intercom('trackEvent', 'clicked-yes-on-academy-modal');
		this.props.history.push('/academy');
	}

	render() {
		return (
			<div className="container">
				<div onClick={this.showAcademy}>
					<InlineSVG
						className="academy-modal-icon"
						element="div"
						src={require('!svg-inline-loader?classPrefix=modal-!../../../images/academy/medal.svg')}
					/>
				</div>
				<h2>Hey there!</h2>
				<p>
					Do you want to learn how to use Prototypo?<br />
					Don't worry, we've set up a series of courses just for you.
				</p>
				<br />
				<div className="action-form-buttons">
					<Button
						click={this.exit}
						label="No thanks, I know what I'm doing"
						neutral
					/>
					<Button click={this.showAcademy} label="Sure, let's go ahead!" />
				</div>
			</div>
		);
	}
}

export default withRouter(AcademyModal);
