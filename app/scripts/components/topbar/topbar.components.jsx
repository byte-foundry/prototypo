import PropTypes from 'prop-types';
import React from 'react';
import {graphql, gql} from 'react-apollo';
import Lifespan from 'lifespan';

import Log from '~/services/log.services.js';

import LocalClient from '~/stores/local-client.stores.jsx';

import {indivGroupsCreationTutorialLabel} from '../../helpers/joyride.helpers.js';
import {fileTutorialLabel} from '../../helpers/joyride.helpers.js';
import {collectionsTutorialLabel} from '../../helpers/joyride.helpers.js';

import withCountry from '../shared/with-country.components';
import Price from '../shared/price.components';

import {
	TopBarMenu,
	TopBarMenuDropdown,
	TopBarMenuDropdownItem,
	TopBarMenuAction,
	TopBarMenuIcon,
	TopBarMenuLink,
	TopBarMenuButton,
	TopBarMenuAcademy,
	TopBarMenuAcademyIcon,
} from './top-bar-menu.components.jsx';
import AllowedTopBarWithPayment from './allowed-top-bar-with-payment.components.jsx';

class Topbar extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			from: 0,
			eventList: [],
			mode: [],
			export: false,
			academyProgress: {},
			errorExport: false,
			credits: undefined,
			plan: undefined,
			creditChoices: undefined,
			presets: null,
		};

		//function binding to avoid unnecessary re-render
		this.exportGlyphr = this.exportGlyphr.bind(this);
		this.setAccountRoute = this.setAccountRoute.bind(this);
		this.goToSubscribe = this.goToSubscribe.bind(this);
		this.resetFileTutorial = this.resetFileTutorial.bind(this);
		this.resetCollectionTutorial = this.resetCollectionTutorial.bind(this);
		this.setPreset = this.setPreset.bind(this);
		this.resetIndivTutorial = this.resetIndivTutorial.bind(this);
		this.setAcademyText = this.setAcademyText.bind(this);
		this.showAcademy = this.showAcademy.bind(this);
		this.clearAcademyText = this.clearAcademyText.bind(this);
		this.getRightAcademyIcon = this.getRightAcademyIcon.bind(this);
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					mode: head.toJS().d.uiMode,
					export: head.toJS().d.export,
					errorExport: head.toJS().d.errorExport,
					credits: head.toJS().d.credits,
					at: head.toJS().d.undoAt,
					eventList: head.toJS().d.undoEventList,
					presets: head.toJS().d.fontPresets,
					indiv: head.toJS().d.indivMode,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

			this.client.getStore('/userStore', this.lifespan)
				.onUpdate((head) => {
					this.setState({
						subscription: head.toJS().d.subscription,
						hasBeenSubscribing: head.toJS().d.hasBeenSubscribing,
					});
				})
				.onDelete(() => {
					this.setState(undefined);
				});

		const creditChoices = await this.client.fetch('/creditStore');

		this.setState({
			creditChoices: creditChoices.head.toJS(),
		});
	}

	static contextTypes = {
		router: React.PropTypes.object.isRequired,
	};

	exportOTF(merged) {
		this.client.dispatchAction('/export-otf', {merged});
		Log.ui('Topbar.exportOTF', merged ? 'merged' : 'not merged');
	}

	setupExportAs(merged) {
		this.client.dispatchAction('/set-up-export-otf', {merged});
		Log.ui('Topbar.exportOTF', merged ? 'merged' : 'not merged');
	}

	exportGlyphr() {
		this.client.dispatchAction('/export-glyphr');
		Log.ui('Topbar.exportGlyphr');
	}

	resetAllParams() {
		this.client.fetch('/prototypoStore')
			.then((typedata) => {
				const params = typedata.head.toJS().fontParameters;
				const flattenParams = _.flatten(_.map(params, (paramObject) => {
					return paramObject.parameters;
				}));
				const defaultParams = _.transform(flattenParams, (result, param) => {
					result[param.name] = param.init;
				}, {});

				this.client.dispatchAction('/change-param', {values: defaultParams, demo: true});
			});

	}

	resetAllChanges() {
		this.resetAllParams();
		this.client.dispatchAction('/reset-all-glyphs', {});

	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	logout() {
		this.client.dispatchAction('/sign-out');
		Log.ui('Topbar.logout');
	}

	newProject() {
		this.client.dispatchAction('/store-value', {openFamilyModal: true});
		Log.ui('Topbar.logout');
	}

	startTuto() {
		this.client.dispatchAction('/store-value', {uiOnboard: false, uiOnboardstep: 'welcome'});
	}

	individualize() {
		this.client.dispatchAction('/toggle-individualize');
	}

	toggleView(name) {
		const newViewMode = _.xor(this.state.mode, [name]);

		if (newViewMode.length > 0) {
			this.client.dispatchAction('/store-value', {uiMode: newViewMode});
			Log.ui('Topbar.toggleView', name);
		}
	}

	goToSubscribe() {
		window.Intercom('trackEvent', 'clickTakeFullAdvantageOfPrototypo');
		Log.ui('GoPro.open');
		/*this.context.router.push({
			pathname: '/account/subscribe',
		});*/
		this.client.dispatchAction('/store-value', {
			openGoProModal: true,
			goProModalBilling: 'monthly',
		});
	}

	resetFileTutorial(e) {
		e.stopPropagation();
		e.preventDefault();
		this.client.dispatchAction('/store-value', {firstTimeFile: true});
		this.client.dispatchAction('/store-value', {uiJoyrideTutorialValue: fileTutorialLabel});
		this.client.dispatchAction('/store-value', {topbarItemDisplayed: 1});
		return false;
	}

	resetCollectionTutorial() {
		this.client.dispatchAction('/store-value', {firstTimeCollection: true, uiJoyrideTutorialValue: collectionsTutorialLabel});
		this.client.dispatchAction('/store-value', {uiShowCollection: true});
	}

	resetIndivTutorial() {
		this.client.dispatchAction('/store-value', {firstTimeIndivCreate: true});
		this.client.dispatchAction('/store-value', {uiJoyrideTutorialValue: indivGroupsCreationTutorialLabel});
		if (!this.state.indiv) {
			this.client.dispatchAction('/toggle-individualize');
		}
	}

	setAccountRoute() {

	}

	showAcademy() {
		this.context.router.push('/academy');
	}

	setAcademyText(name, isIcon) {
		if (name) {
			this.setState({academyText: name, academyCapIconHovered: isIcon});
		}
		else {
			this.setState({academyCapIconHovered: isIcon});
		}
	}

	clearAcademyText() {
		this.setState({academyText: '', academyCapIconHovered: false});
	}
	getRightAcademyIcon() {
		if (this.state.academyCapIconHovered) {
			return this.state.indiv ? "assets/images/graduate-cap-yellow.svg" : "assets/images/graduate-cap-green.svg";
		}
		else {
			return "assets/images/graduate-cap.svg";
		}
	}

	async onboardExport(step) {
		const store = await this.client.fetch('/prototypoStore');

		if (store.get('uiOnboard')) {
			return;
		}

		const currentStep = store.get('uiOnboardstep');

		if (currentStep === 'export' && step === 'export-2') {
			this.client.dispatchAction('/store-value', {uiOnboardstep: step});
		}
		else if (currentStep === 'export-2' && step === 'export') {
			this.client.dispatchAction('/store-value', {uiOnboardstep: step});
		}
		else if (currentStep === 'premature-end') {
			this.client.dispatchAction('/store-value', {uiOnboard: true});
		}
	}

	setPreset(preset) {
		this.client.dispatchAction('/set-preset', preset);
	}

	render() {
		const {academyProgress, loadingAcademyProgress} = this.props;

		const whereAt = this.state.at || 0;
		const undoDisabled = whereAt < 1;
		const redoDisabled = whereAt > (this.state.eventList.length - 2);
		const undoText = `Undo ${this.state.eventList.length && !undoDisabled ? this.state.eventList[whereAt].label : ''}`;
		const redoText = `Redo ${redoDisabled ? '' : this.state.eventList[whereAt + 1].label}`;
		const credits = this.state.credits;
		const freeAccount = !this.state.subscription;
		const freeAccountAndHasCredits = (credits && credits > 0) && freeAccount;
		const otfExportCost = this.state.creditChoices ? this.state.creditChoices.exportOtf : false;
		const glyphrExportCost = this.state.creditChoices ? this.state.creditChoices.exportGlyphr : false;
		const exporting = this.state.export && (
			<TopBarMenuAction name="Exporting..." click={() => {return;}} action={true}/>
		);
		const errorExporting = this.state.errorExport && (
			<TopBarMenuAction
				name={
					this.state.errorExport.message
					? this.state.errorExport.message
					: 'An error occured during exporting'
				}
				click={() => {return;}}
				action={true}/>
			);
		const creditExportLabel = !!this.state.credits
			&& <TopBarMenuAction name={`${this.state.credits} credits`} click={() => {return;}} action={true} alignRight={true}/>;
		const callToAction = !(freeAccountAndHasCredits || !freeAccount) && (
			<TopBarMenuButton
				label={<span>GET THE FULL VERSION FOR <Price amount={this.state.hasBeenSubscribing ? 8.25 : 1} country={this.props.country} /></span>}
				noHover
				centered
				click={this.goToSubscribe}
				alignRight
			/>
		);

		const academyIcon = (loadingAcademyProgress || !academyProgress.lastCourse) && (
			<TopBarMenuAcademyIcon
				setText={this.setAcademyText}
				clearText={this.clearAcademyText}
				id="progress-academy"
				icon={this.getRightAcademyIcon()}
			/>
		);

		const academyProgressItem = (!loadingAcademyProgress && academyProgress.lastCourse) && (
			<TopBarMenuAcademy
				course={academyProgress[academyProgress.lastCourse]}
				setText={this.setAcademyText}
				clearText={this.clearAcademyText}
				text={this.state.academyText}
				id="progress-academy"
				icon={this.getRightAcademyIcon()}
			/>
		);

			/*const presetSubMenu = this.state.presets
			? (
				<TopBarMenuDropdownItem name="Choose a preset ...">
					<TopBarMenuDropdown>
						{
							_.keys(this.state.presets).map((preset, index) => {
								return (
									<TopBarMenuDropdownItem
										name={preset}
										handler={this.setPreset}
										handlerParam={preset}
										key={index}
									/>
								);
							})
						}
					</TopBarMenuDropdown>
				</TopBarMenuDropdownItem>
			)
			: false;*/

		return (
			<div id="topbar">
				<TopBarMenu>
					<TopBarMenuIcon className="side-tabs-icon-headers" img="assets/images/prototypo-icon.svg"/>
					<TopBarMenuDropdown
						name="File"
						id="file-menu"
						idMenu="file-dropdown"
						enter={() => { this.onboardExport('export-2'); }}
						leave={() => {this.onboardExport('export');}}>
						<TopBarMenuDropdownItem name="New project" handler={() => {this.newProject();}} separator={true}/>
						<AllowedTopBarWithPayment credits={credits} freeAccount={freeAccount}>
							<TopBarMenuDropdownItem
								name="Export font"
								id="export-to-merged-otf"
								freeAccount={freeAccount}
								freeAccountAndHasCredits={freeAccountAndHasCredits}
								cost={otfExportCost}
								credits={this.state.credits}
								handler={() => {this.exportOTF(true);}}/>
							<TopBarMenuDropdownItem
								name="Export font as..."
								id="export-to-merged-otf-as"
								freeAccount={freeAccount}
								freeAccountAndHasCredits={freeAccountAndHasCredits}
								cost={otfExportCost}
								credits={this.state.credits}
								handler={() => {this.setupExportAs(true);}}/>
							<TopBarMenuDropdownItem
								name="Export source file"
								id="export-to-otf"
								freeAccount={freeAccount}
								freeAccountAndHasCredits={freeAccountAndHasCredits}
								cost={otfExportCost}
								credits={this.state.credits}
								handler={() => {this.exportOTF(false);}}/>
							<TopBarMenuDropdownItem
								name="Export to Glyphr Studio"
								id="export-to-glyphr-studio"
								freeAccount={freeAccount}
								freeAccountAndHasCredits={freeAccountAndHasCredits}
								cost={glyphrExportCost}
								handler={this.exportGlyphr}
								credits={this.state.credits}
								separator={true}/>
						</AllowedTopBarWithPayment>
						<TopBarMenuDropdownItem
							name="Download Web Preview extension"
							separator={true}
							handler={() => { window.open('https://chrome.google.com/webstore/detail/prototypo-web-preview/jglgljnhjnblboeonagfmfgglfdeakkf', '_blank'); }}/>
						<TopBarMenuDropdownItem
							name="Logout"
							handler={() => {this.logout();}}/>
					</TopBarMenuDropdown>
					<TopBarMenuDropdown name="Edit">
						<TopBarMenuDropdownItem
							name="Individualize parameters"
							freeAccount={freeAccount}
							freeAccountAndHasCredits={freeAccountAndHasCredits}
							handler={() => { this.individualize(); }}/>
						<TopBarMenuDropdownItem
							name={undoText}
							key="undo"
							disabled={undoDisabled}
							shortcut="ctrl+z"
							handler={() => {
								if (!undoDisabled) {
									this.client.dispatchAction('/go-back', {eventIndex: this.state.at});
								}
							}}/>
						<TopBarMenuDropdownItem
							name={redoText}
							key="redo"
							disabled={redoDisabled}
							shortcut="ctrl+y"
							handler={() => {
								if (!redoDisabled) {
									this.client.dispatchAction('/go-forward', {eventIndex: this.state.at});
								}
							}}/>
							{/* <TopBarMenuDropdownItem name="Choose a preset" handler={() => {}}/> */}
						<TopBarMenuDropdownItem
							name="Reset all parameters"
							handler={() => { this.resetAllParams(); }}/>
						<TopBarMenuDropdownItem
							name="Reset all changes"
							handler={() => { this.resetAllChanges(); }}/>
					</TopBarMenuDropdown>
					<TopBarMenuDropdown name="Window">
						<TopBarMenuDropdownItem name="Glyphs list" checkbox={true} active={this.state.mode.indexOf('list') !== -1} handler={() => { this.toggleView('list'); }} separator={true}/>
						<TopBarMenuDropdownItem name="Glyph view" checkbox={true} active={this.state.mode.indexOf('glyph') !== -1} handler={() => { this.toggleView('glyph'); }}/>
						<TopBarMenuDropdownItem name="Text view" checkbox={true} active={this.state.mode.indexOf('text') !== -1} handler={() => { this.toggleView('text'); }}/>
						<TopBarMenuDropdownItem name="Word view" checkbox={true} active={this.state.mode.indexOf('word') !== -1} handler={() => { this.toggleView('word'); }}/>
					</TopBarMenuDropdown>
					<TopBarMenuDropdown name="Help">
						<TopBarMenuDropdownItem name="Chat with us!" handler={() => { window.Intercom('show');}}/>
						<TopBarMenuDropdownItem name="FAQ" handler={() => { window.open('https://www.prototypo.io/faq', '_blank'); }}/>
						<TopBarMenuDropdownItem name="Academy" id="access-academy" handler={this.showAcademy}/>
						<TopBarMenuDropdownItem name="Restart collection tutorial" handler={this.resetCollectionTutorial}/>
						<TopBarMenuDropdownItem name="Restart export tutorial" handler={this.resetFileTutorial}/>
						<TopBarMenuDropdownItem name="Restart individualization tutorial" handler={this.resetIndivTutorial}/>
					</TopBarMenuDropdown>
					{academyIcon}
					{academyProgressItem}
					{exporting}
					{errorExporting}
					<TopBarMenuLink link="/account" title="Account settings" img="icon-profile.svg" imgDarkBackground={true} alignRight={true} action={true}></TopBarMenuLink>
					{creditExportLabel}
					{callToAction}
				</TopBarMenu>
			</div>
		);
	}
}

Topbar.defaultProps = {
	academyProgress: {
		lastCourse: null,
	},
};

Topbar.propTypes = {
	academyProgress: PropTypes.shape({
		lastCourse: PropTypes.string,
	}),
};

Topbar.contextTypes = {
	router: React.PropTypes.object.isRequired,
};

// this should later wrap an TopBarAcademy
// instead of being on this component
const getAcademyValuesQuery = gql`
	query getAcademyValues {
		user {
			id
			academyProgress
		}
	}
`;

export default graphql(getAcademyValuesQuery, {
	props({data}) {
		if (data.loading) {
			return {loadingAcademyProgress: true};
		}

		return {academyProgress: data.user.academyProgress};
	},
})(withCountry(Topbar));
