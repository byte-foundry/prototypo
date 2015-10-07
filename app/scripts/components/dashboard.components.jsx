import React from 'react';
import Sidebar from './sidebar.components.jsx';
import Workboard from './workboard.components.jsx';
import pleaseWait from 'please-wait';
import {OnBoarding, OnBoardingStep} from './onboarding.components.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';

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
	}

	shouldComponentUpdate(newProps, newState) {
		return (
			newState.onboard !== this.state.onboard ||
			(!newState.onboard && newState.step !== this.state.step)
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
						<p>This little tutorial will explain the basic features of Prototypo and how to use them</p>
						<div className="onboarding-step-footer">
							<button className="onboarding-step-footer-btn" onClick={() => {this.goToNextStep('createFamily')}}>Proceed to next step</button>
							<button className="onboarding-step-footer-btn" onClick={() => {this.exitOnboarding()}}>Exit tutorial</button>
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
						<p>Choose a font name and a template and click on create to finish the creation</p>
					</OnBoardingStep>
					<OnBoardingStep name="customize" type="indicator" target="font-controls">
						<p className="onboarding-step-title">Customizing your font</p>
						<p>Your font family is created you can now customize your font using the parameters</p>
					</OnBoardingStep>
					<OnBoardingStep name="customizing" type="indicator" target="parameters" inverseArrow={true} offset={'-40px -50px'}>
						<p className="onboarding-step-title">Customizing your font</p>
						<p>Adjust the different parameters to customize your. There is three differents type of parameters.</p>
						<p>From here you can explore the different component of the interface (list of glyphs, views...) or directly export your font</p>
						<div className="onboarding-step-footer">
							<button className="onboarding-step-footer-btn" onClick={() => {this.goToNextStep('exploreUI')}}>Explore the interface</button>
							<button className="onboarding-step-footer-btn" onClick={() => {this.goToNextStep('export')}}>Export your font</button>
						</div>
					</OnBoardingStep>
					<OnBoardingStep name="export" type="indicator" target="file-menu" arrowPos="top" inverseArrow={true} targetAlign="bottom center" elementAlign="top center" offset="-50px 0px">
						<p className="onboarding-step-title">Export your font</p>
						<p>Click on the file menu to export your font</p>
					</OnBoardingStep>
					<OnBoardingStep name="export-2" type="indicator" target="file-dropdown" arrowPos="top" inverseArrow={true} targetAlign="bottom left" elementAlign="top left" offset="-50px 200px" width="700px">
						<p className="onboarding-step-title">Export your font</p>
						<p>There is 3 options for the export:</p>
						<ul>
							<li>
								<h2 className="onboarding-list-title">Export to merged otf</h2>
								This will provide you a completely merged font. This provides the maximum compability with OSes and browsers. However due to limitations with our engine this font is polygonal, which means that there is no bezier curve and it may be hard to work with in a specialized font software.
							</li>
							<li>
								<h2 className="onboarding-list-title">Export to otf</h2>
								This will provide you a basic otf font. These exports may exhibit some visual glitch (especially in Windows and Mac). You can correct these problems by removing the overlaps in the font using specialized software like FontForge or Fontlab.
							</li>
							<li>
								<h2 className="onboarding-list-title">Export to Glyphr Studio</h2>
								Will import your font directly into the Glyphr studio app.
							</li>
						</ul>
					</OnBoardingStep>
					<OnBoardingStep name="end" type="fullModal">
						<h1>Right on !</h1>
						<p>You just finished the tutorial. You now know the basic functionality offered by Prototypo.</p>
						<p>If you want to go further you can subscribe to our professional plan to enjoy the full customization potential.</p>
						<div className="onboarding-step-footer">
							<button className="onboarding-step-footer-btn" onClick={() => {this.exitOnboarding()}}>Exit tutorial</button>
						</div>
					</OnBoardingStep>
				</OnBoarding>
		) : false;

		return (
			<div id="dashboard">
				<Sidebar />
				<Workboard />
				{onboarding}
			</div>
		)
	}
}
