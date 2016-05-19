import React from 'react';
import pleaseWait from 'please-wait';
import Lifespan from 'lifespan';
import ClassNames from 'classnames';

import LocalClient from '../stores/local-client.stores.jsx';

import Topbar from './topbar.components.jsx';
import Toolbar from './toolbar/toolbar.components.jsx';
import Workboard from './workboard.components.jsx';
import {OnBoarding, OnBoardingStep} from './onboarding.components.jsx';
//import NpsMessage from './nps-message.components.jsx';

export default class Dashboard extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	async componentWillMount() {
		pleaseWait.instance.finish();

		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/panel', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					onboard: head.toJS().onboard,
					step: head.toJS().onboardstep,
				});
			})
			.onDelete(() => {
				this.setState({
					onboard: undefined,
					step: undefined,
				});
			});

		this.client.getStore('/individualizeStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({indiv: head.toJS().indivMode});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	shouldComponentUpdate(newProps, newState) {
		return (
			newState.onboard !== this.state.onboard
			|| newState.indiv !== this.state.indiv
			|| (!newState.onboard && newState.step !== this.state.step)
		);
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	goToNextStep(step) {
		this.client.dispatchAction('/store-panel-param', {onboardstep: step});
	}

	exitOnboarding() {
		this.client.dispatchAction('/store-panel-param', {onboard: true});
	}

	render() {

		/* These are some guidelines about css:
		 * - All these guidelines have to be considered in the scope of SMACSS
		 * - All the first descendant of dashboard are unique layout container
		 * (i.e they have a unique id in there first element preferrably the
		 * lowercased name of the component)
		 * - Layout component should be named with a Capitalized name
		 * (i.e Sidebar, Menubar or Workboard)
		 * - All descendant of layout components are modules
		 * - the modules should have a class that is the name of the component
		 * in kebab-case (YoYoMa -> yo-yo-ma);
		 * - layout styles are prefixed with "l-"
		 * - state styles are prefixed with "is-"
		*/
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] dashboard');
		}

		const onboarding = !this.state.onboard ? (
				<OnBoarding step={this.state.step}>
					<OnBoardingStep name="welcome" type="fullModal">
						<h1>Welcome to Prototypo</h1>
						<p>This little tutorial will explain the basic features of Prototypo and how to use them.</p>
						<div className="onboarding-step-footer">
							<button className="onboarding-step-footer-btn" onClick={() => {this.goToNextStep('createFamily');}}>Proceed to next step</button>
							<button className="onboarding-step-footer-btn exit" onClick={() => {this.exitOnboarding();}}>Exit tutorial</button>
						</div>
					</OnBoardingStep>
					<OnBoardingStep name="createFamily" type="indicator" target="font-collection">
						<p className="onboarding-step-title">Creating a Family</p>
						<p>To create a family you need to enter your font collection by clicking on the "Collection" tab</p>
					</OnBoardingStep>
					<OnBoardingStep name="creatingFamily" type="indicator" target="font-create" width="450px">
						<p className="onboarding-step-title">Creating a Family</p>
						<p>Click on "Create a new Family" to begin the creation of your new font family</p>
					</OnBoardingStep>
					<OnBoardingStep name="creatingFamily-2" type="indicator" target="font-create" width="450px">
						<p className="onboarding-step-title">Creating a Family</p>
						<p>Give a name to your font, select a template, and click on Create to finish the creation</p>
					</OnBoardingStep>
					<OnBoardingStep name="customize" type="indicator" target="font-controls">
						<p className="onboarding-step-title">Customizing your font</p>
						<p>Your font family is created! You can now customize your font using the parameters in the next segment.</p>
					</OnBoardingStep>
					<OnBoardingStep name="customizing" type="indicator" target="parameters" inverseArrow={true} offset={'-80px -50px'}>
						<p className="onboarding-step-title">Customizing your font</p>
						<p>Adjust the parameters to customize your font. There are three different types of parameters available in this tutorial.</p>
						<p>From here, you can explore different components of the interface (list of glyphs, views, etc.), or you can directly export your font.</p>
						<div className="onboarding-step-footer">
							<button className="onboarding-step-footer-btn" onClick={() => {this.goToNextStep('export');}}>Export your font</button>
						</div>
					</OnBoardingStep>
					<OnBoardingStep name="export" type="indicator" target="file-menu" arrowPos="top" inverseArrow={true} targetAlign="bottom center" elementAlign="top center" offset="-50px -18px">
						<p className="onboarding-step-title">Export your font</p>
						<p>Click on the file menu to export your font</p>
					</OnBoardingStep>
					<OnBoardingStep name="export-2" type="indicator" target="file-dropdown" arrowPos="top" inverseArrow={true} targetAlign="bottom left" elementAlign="top left" offset="-50px 200px" width="700px">
						<p className="onboarding-step-title">Export your font</p>
						<p>There are 3 options for exporting your new font:</p>
						<ul>
							<li>
								<h2 className="onboarding-list-title">Export to merged OTF</h2>
								This will generate a completely merged font.
							</li>
							<li>
								<h2 className="onboarding-list-title">Export to OTF</h2>
								This will generate a basic otf font. These exports may exhibit some visual glitch (especially in Windows).
							</li>
							<li>
								<h2 className="onboarding-list-title">Export to Glyphr Studio</h2>
								This will import your font directly into the Glyphr studio app.
							</li>
						</ul>
					</OnBoardingStep>
					<OnBoardingStep name="end" type="fullModal">
						<h1>Right on!</h1>
						<p>You just finished the tutorial. You now know the basic functionality offered by Prototypo.</p>
						<p>If you want to go further you can subscribe to <a href="www.prototypo.io/pricing" target="_blank">our professional plan</a> to enjoy the full customization potential.</p>
						<div className="onboarding-step-footer">
							<button className="onboarding-step-footer-btn exit" onClick={() => {this.exitOnboarding();}}>Exit tutorial</button>
						</div>
					</OnBoardingStep>
					<OnBoardingStep name="premature-end" type="indicator" target="file-menu" arrowPos="top" inverseArrow={true} targetAlign="bottom center" elementAlign="top center" offset="-50px -18px" noclose={true}>
						<h1>Don't worry!</h1>
						<p>You can restart the tutorial if you so desire by clicking the "Restart tutorial" button in the file menu</p>
						<div className="onboarding-step-footer">
							<button className="onboarding-step-footer-btn exit" onClick={() => {this.exitOnboarding();}}>Exit tutorial</button>
						</div>
					</OnBoardingStep>
				</OnBoarding>
		) : false;

		const classes = ClassNames({
			'indiv': this.state.indiv,
			'normal': !this.state.indiv,
		});

		return (
			<div id="dashboard" className={classes}>
				<Topbar />
				<Toolbar />
				<Workboard />
				{onboarding}
			</div>
		);
	}
}
