import _xor from 'lodash/xor';
import _flatten from 'lodash/flatten';
import _map from 'lodash/map';
import _transform from 'lodash/transform';
import PropTypes from 'prop-types';
import React from 'react';
import {graphql, gql, compose} from 'react-apollo';
import Lifespan from 'lifespan';

import Log from '../../services/log.services';

import LocalClient from '../../stores/local-client.stores';

import {indivGroupsCreationTutorialLabel, fileTutorialLabel, collectionsTutorialLabel} from '../../helpers/joyride.helpers';

import withCountry from '../shared/with-country.components';
import Price from '../shared/price.components';
import Logout from '../logout.components';

import TopBarMenu from './top-bar-menu.components';
import TopBarMenuAction from './top-bar-menu-action.components';
import TopBarMenuIcon from './top-bar-menu-icon.components';
import TopBarMenuLink from './top-bar-menu-link.components';
import TopBarMenuButton from './top-bar-menu-button.components';
import TopBarMenuDropdown from './top-bar-menu-dropdown.components';
import TopBarMenuDropdownItem from './top-bar-menu-dropdown-item.components';
import TopBarMenuDropdownProItem from './top-bar-menu-dropdown-pro-item.components';
import TopBarMenuAcademy from './top-bar-menu-academy.components';
import TopBarMenuAcademyIcon from './top-bar-menu-academy-icon.components';
import AllowedTopBarWithPayment from './allowed-top-bar-with-payment.components';

class Topbar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			eventList: [],
			mode: [],
			export: false,
			errorExport: false,
			credits: undefined,
			creditChoices: undefined,
			presets: null,
		};

		// function binding to avoid unnecessary re-render
		this.exportGlyphr = this.exportGlyphr.bind(this);
		this.exportAs = this.exportAs.bind(this);
		this.exportMergedOTF = this.exportMergedOTF.bind(this);
		this.exportFamily = this.exportFamily.bind(this);
		this.individualize = this.individualize.bind(this);
		this.setAccountRoute = this.setAccountRoute.bind(this);
		this.goToSubscribe = this.goToSubscribe.bind(this);
		this.resetFileTutorial = this.resetFileTutorial.bind(this);
		this.resetCollectionTutorial = this.resetCollectionTutorial.bind(this);
		// this.setPreset = this.setPreset.bind(this);
		this.resetIndivTutorial = this.resetIndivTutorial.bind(this);
		this.setAcademyText = this.setAcademyText.bind(this);
		this.showAcademy = this.showAcademy.bind(this);
		this.clearAcademyText = this.clearAcademyText.bind(this);
		this.getRightAcademyIcon = this.getRightAcademyIcon.bind(this);
		this.saveChoiceValues = this.saveChoiceValues.bind(this);
		this.updateBaseFontValues = this.updateBaseFontValues.bind(this);
		this.deleteCurrentStep = this.deleteCurrentStep.bind(this);
		this.deleteCurrentChoice = this.deleteCurrentChoice.bind(this);
		this.editCurrentChoice = this.editCurrentChoice.bind(this);
		this.editCurrentStep = this.editCurrentStep.bind(this);
		this.openExportLiteModal = this.openExportLiteModal.bind(this);
		this.startFileTutorial = this.startFileTutorial.bind(this);
		this.saveChoiceValues = this.saveChoiceValues.bind(this);
		this.updateBaseFontValues = this.updateBaseFontValues.bind(this);
		this.deleteCurrentStep = this.deleteCurrentStep.bind(this);
		this.deleteCurrentChoice = this.deleteCurrentChoice.bind(this);
		this.editCurrentStep = this.editCurrentStep.bind(this);
		this.editCurrentChoice = this.editCurrentChoice.bind(this);
		this.showPreset = this.showPreset.bind(this);
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client
			.getStore('/prototypoStore', this.lifespan)
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
					step: head.toJS().d.step,
					choice: head.toJS().d.choice,
					preset: head.toJS().d.preset,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client
			.getStore('/userStore', this.lifespan)
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

	componentWillUnmount() {
		this.lifespan.release();
	}

	exportMergedOTF() {
		this.client.dispatchAction('/export-otf', {merged: true});
		Log.ui('Topbar.exportOTF', 'merged');
	}

	exportAs() {
		this.client.dispatchAction('/set-up-export-otf', {merged: true});
		Log.ui('Topbar.exportOTF', 'merged');
	}

	setAcademyText(name, isIcon) {
		if (name) {
			this.setState({academyText: name, academyCapIconHovered: isIcon});
		}
		else {
			this.setState({academyCapIconHovered: isIcon});
		}
	}

	exportGlyphr() {
		this.client.dispatchAction('/export-glyphr');
		Log.ui('Topbar.exportGlyphr');
	}

	exportFamily() {
		this.client.dispatchAction('/export-family');
		Log.ui('Topbar.exportFamily');
	}

	resetAllParams() {
		this.client.fetch('/prototypoStore').then((typedata) => {
			const params = typedata.head.toJS().fontParameters;
			const flattenParams = _flatten(_map(params, paramObject => paramObject.parameters));
			const defaultParams = _transform(
				flattenParams,
				(result, param) => {
					result[param.name] = param.init;
				},
				{},
			);

			this.client.dispatchAction('/change-param', {values: defaultParams, demo: true, force: true});
		});
	}

	resetAllChanges() {
		this.resetAllParams();
		this.client.dispatchAction('/reset-all-glyphs', {});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	newProject() {
		this.client.dispatchAction('/store-value', {openFamilyModal: true});
		Log.ui('Topbar.newProject');
	}

	startTuto() {
		this.client.dispatchAction('/store-value', {uiOnboard: false, uiOnboardstep: 'welcome'});
	}

	individualize() {
		this.client.dispatchAction('/toggle-individualize');
	}

	toggleView(name) {
		const newViewMode = _xor(this.state.mode, [name]);

		if (newViewMode.length > 0) {
			this.client.dispatchAction('/store-value', {uiMode: newViewMode});
			Log.ui('Topbar.toggleView', name);
		}
	}

	goToSubscribe() {
		window.Intercom('trackEvent', 'clickTakeFullAdvantageOfPrototypo');
		Log.ui('GoPro.open');
		/* this.context.router.push({
			pathname: '/account/subscribe',
		}); */
		this.client.dispatchAction('/store-value', {
			openGoProModal: true,
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
		this.client.dispatchAction('/store-value', {
			firstTimeCollection: true,
			uiJoyrideTutorialValue: collectionsTutorialLabel,
		});
		this.client.dispatchAction('/store-value', {uiShowCollection: true});
	}

	resetIndivTutorial() {
		this.client.dispatchAction('/store-value', {firstTimeIndivCreate: true});
		this.client.dispatchAction('/store-value', {
			uiJoyrideTutorialValue: indivGroupsCreationTutorialLabel,
		});
		if (!this.state.indiv) {
			this.client.dispatchAction('/toggle-individualize');
		}
	}

	setAccountRoute() {}

	showAcademy() {
		this.context.router.push('/academy');
	}

	clearAcademyText() {
		this.setState({academyText: '', academyCapIconHovered: false});
	}
	getRightAcademyIcon() {
		if (this.state.academyCapIconHovered) {
			return this.state.indiv
				? 'assets/images/graduate-cap-yellow.svg'
				: 'assets/images/graduate-cap-green.svg';
		}
		return 'assets/images/graduate-cap.svg';
	}

	exportOTF(merged) {
		this.client.dispatchAction('/export-otf', {merged});
		Log.ui('Topbar.exportOTF', merged ? 'merged' : 'not merged');
	}


	startFileTutorial() {
		this.client.dispatchAction('/store-value', {uiJoyrideTutorialValue: fileTutorialLabel});
	}

	showPreset() {
		this.client.dispatchAction('/show-base-values');
	}

	saveChoiceValues() {
		this.client.dispatchAction('/save-choice-values');
	}

	updateBaseFontValues() {
		this.client.dispatchAction('/update-base-font-values');
	}

	async deleteCurrentStep() {
		try {
			const {data: {deleteStep: deletedStep}} = await this.props.deleteStep(this.state.step.id);

			this.client.dispatchAction('/deleted-current-step', deletedStep);
		}
		catch (err) {
			this.setState({error: err.message});
		}
	}

	async deleteCurrentChoice() {
		try {
			const {data: {deleteChoice: deletedChoice}} = await this.props.deleteChoice(this.state.choice.id);

			this.client.dispatchAction('/deleted-current-choice', deletedChoice);
		}
		catch (err) {
			this.setState({error: err.message});
		}
	}

	editCurrentStep() {
		this.client.dispatchAction('/store-value', {openStepModal: true, stepModalEdit: true});
	}

	editCurrentChoice() {
		this.client.dispatchAction('/store-value', {openChoiceModal: true, choiceModalEdit: true});
	}

	openExportLiteModal() {
		this.client.dispatchAction('/store-value', {openExportLiteModal: true});
	}


	render() {
		const {academyProgress, loadingAcademyProgress} = this.props;
		const whereAt = this.state.at || 0;
		const undoDisabled = whereAt < 1;
		const redoDisabled = whereAt > this.state.eventList.length - 2;
		const undoText = `Undo ${this.state.eventList.length && !undoDisabled
			? this.state.eventList[whereAt].label
			: ''}`;
		const redoText = `Redo ${redoDisabled ? '' : this.state.eventList[whereAt + 1].label}`;
		const credits = this.state.credits; // eslint-disable-line prefer-destructuring
		const freeAccount = !this.props.manager && !this.state.subscription;
		const otfExportCost = this.state.creditChoices ? this.state.creditChoices.exportOtf : 0;
		const glyphrExportCost = this.state.creditChoices
			? this.state.creditChoices.exportGlyphr
			: 0;
		const exporting = this.state.export && (
			<TopBarMenuAction
				name="Exporting..."
				click={() => {

				}}
				action
			/>
		);
		const errorExporting = this.state.errorExport && (
			<TopBarMenuAction
				name={
					this.state.errorExport.message ? (
						this.state.errorExport.message
					) : (
						'An error occured during exporting'
					)
				}
				click={() => {

				}}
				action
			/>
		);
		const creditExportLabel = !!this.state.credits && (
			<TopBarMenuAction
				name={`${this.state.credits} credits`}
				click={() => {

				}}
				action
				alignRight
			/>
		);
		const callToAction = !(credits > 0 || !freeAccount) && (
			<TopBarMenuButton
				label={
					<span>
						GET THE FULL VERSION FOR{' '}
						<Price amount={this.state.hasBeenSubscribing ? 8.25 : 1} country={this.props.country} />
					</span>
				}
				noHover
				centered
				click={this.goToSubscribe}
				alignRight
			/>);

		const academyIcon = !academyProgress.lastCourse && (
			<TopBarMenuAcademyIcon
				setText={this.setAcademyText}
				clearText={this.clearAcademyText}
				id="progress-academy"
				headerClassName="academy-progress-container"
				icon={this.getRightAcademyIcon()}
			/>);

		const academyProgressItem = !loadingAcademyProgress
		&& academyProgress.lastCourse
		&& academyProgress[academyProgress.lastCourse] && (
		<TopBarMenuAcademy
					course={academyProgress[academyProgress.lastCourse]}
					setText={this.setAcademyText}
					clearText={this.clearAcademyText}
					text={this.state.academyText}
					id="progress-academy"
					headerClassName="academy-progress-container"
					icon={this.getRightAcademyIcon()}
				/>
			);

		/* const presetSubMenu = this.state.presets
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
			: false; */

		return (
			<TopBarMenu id="topbar">
				<TopBarMenuIcon
					className="side-tabs-icon-headers"
					img="assets/images/prototypo-icon.svg"
				/>
				{/* TODO: pass down props to TopBarMenuItem to get the onSelect callback */}
				<TopBarMenuDropdown
					name="File"
					id="file-menu"
					idMenu="file-dropdown"
					enter={() => {
						this.onboardExport('export-2');
					}}
					leave={() => {
						this.onboardExport('export');
					}}
					onSelect={this.startFileTutorial}
				>
					<TopBarMenuDropdownItem
						name="New project"
						handler={() => {
							this.newProject();
						}}
						separator
					/>
					<AllowedTopBarWithPayment credits={credits} freeAccount={freeAccount}>
						<TopBarMenuDropdownProItem
							name="Export font"
							id="export-to-merged-otf"
							freeAccount={freeAccount}
							cost={otfExportCost}
							credits={this.state.credits}
							handler={this.exportMergedOTF}
						/>
						<TopBarMenuDropdownProItem
							name="Export font as..."
							id="export-to-merged-otf-as"
							freeAccount={freeAccount}
							cost={otfExportCost}
							credits={this.state.credits}
							handler={this.exportAs}
						/>
						<TopBarMenuDropdownProItem
							name="Export to Glyphr Studio"
							id="export-to-glyphr-studio"
							freeAccount={freeAccount}
							cost={otfExportCost}
							handler={this.exportGlyphr}
							credits={this.state.credits}
							separator
						/>
						{/* <TopBarMenuDropdownProItem
								name="Export family"
								id="export-family"
								freeAccount={freeAccount}
								cost={otfExportCost} // TODO: multiply
								handler={this.exportFamily}
								credits={this.state.credits}
								separator
							/> */}
					</AllowedTopBarWithPayment>
					<TopBarMenuDropdownItem
						name="Download Web Preview extension"
						separator
						handler={() => {
							if (navigator.userAgent.toLowerCase().includes('firefox')) {
								window.open(
									'https://addons.mozilla.org/fr/firefox/addon/prototypo-web-preview/',
									'web-extension',
								);
								return;
							}

							window.open(
								'https://chrome.google.com/webstore/detail/prototypo-web-preview/jglgljnhjnblboeonagfmfgglfdeakkf',
								'web-extension',
							);
						}}
					/>
					<Logout
						render={props => (
							<TopBarMenuDropdownItem
								name="Logout"
								handler={() => {
									Log.ui('Topbar.logout');
									props.logout();
								}}
							/>
						)}
					/>
				</TopBarMenuDropdown>
				<TopBarMenuDropdown name="Edit">
					<TopBarMenuDropdownItem
						name="Individualize parameters"
						freeAccount={freeAccount}
						handler={this.individualize}
					/>
					<TopBarMenuDropdownItem
						name={undoText}
						key="undo"
						disabled={undoDisabled}
						shortcut="ctrl+z"
						handler={() => {
							if (!undoDisabled) {
								this.client.dispatchAction('/go-back', {eventIndex: this.state.at});
							}
						}}
					/>
					<TopBarMenuDropdownItem
						name={redoText}
						key="redo"
						disabled={redoDisabled}
						shortcut="ctrl+y"
						handler={() => {
							if (!redoDisabled) {
								this.client.dispatchAction('/go-forward', {eventIndex: this.state.at});
							}
						}}
					/>
					{/* <TopBarMenuDropdownItem name="Choose a preset" handler={() => {}}/> */}
					<TopBarMenuDropdownItem
						name="Reset all parameters"
						handler={() => {
							this.resetAllParams();
						}}
					/>
					<TopBarMenuDropdownItem
						name="Reset all changes"
						handler={() => {
							this.resetAllChanges();
						}}
					/>
				</TopBarMenuDropdown>
				<TopBarMenuDropdown name="Window">
					<TopBarMenuDropdownItem
						name="Glyphs list"
						checkbox
						active={this.state.mode.indexOf('list') !== -1}
						handler={() => {
							this.toggleView('list');
						}}
						separator
					/>
					<TopBarMenuDropdownItem
						name="Glyph view"
						checkbox
						active={this.state.mode.indexOf('glyph') !== -1}
						handler={() => {
							this.toggleView('glyph');
						}}
					/>
					<TopBarMenuDropdownItem
						name="Text view"
						checkbox
						active={this.state.mode.indexOf('text') !== -1}
						handler={() => {
							this.toggleView('text');
						}}
					/>
					<TopBarMenuDropdownItem
						name="Word view"
						checkbox
						active={this.state.mode.indexOf('word') !== -1}
						handler={() => {
							this.toggleView('word');
						}}
					/>
				</TopBarMenuDropdown>
				<TopBarMenuDropdown name="Help">
					<TopBarMenuDropdownItem
						name="Chat with us!"
						handler={() => {
							window.Intercom('show');
						}}
					/>
					<TopBarMenuDropdownItem
						name="FAQ"
						handler={() => {
							window.open('https://www.prototypo.io/faq', 'faq');
						}}
					/>
					<TopBarMenuDropdownItem name="Academy" id="access-academy" handler={this.showAcademy} />
					<TopBarMenuDropdownItem
						name="Restart collection tutorial"
						handler={this.resetCollectionTutorial}
					/>
					<TopBarMenuDropdownItem
						name="Restart export tutorial"
						handler={this.resetFileTutorial}
					/>
					<TopBarMenuDropdownItem
						name="Restart individualization tutorial"
						handler={this.resetIndivTutorial}
					/>
				</TopBarMenuDropdown>
				<TopBarMenuDropdown name="Lite">
					<TopBarMenuDropdownItem name="Export data" handler={this.openExportLiteModal} />
					<TopBarMenuDropdownItem name="Show base values" handler={this.showPreset} />
					<TopBarMenuDropdownItem name="Update base font values" handler={this.updateBaseFontValues} />
					<TopBarMenuDropdownItem name="Rename step" disabled={this.state.step === undefined} handler={this.editCurrentStep} />
					<TopBarMenuDropdownItem name="Delete step" disabled={this.state.step === undefined} handler={this.deleteCurrentStep} />
					<TopBarMenuDropdownItem name="Rename choice" disabled={this.state.choice === undefined} handler={this.editCurrentChoice} />
					<TopBarMenuDropdownItem name="Delete choice" disabled={this.state.choice === undefined} handler={this.deleteCurrentChoice} />
					<TopBarMenuDropdownItem name="Save choice values" disabled={this.state.choice === undefined} handler={this.saveChoiceValues} />
				</TopBarMenuDropdown>
				{academyIcon}
				{academyProgressItem}
				{exporting}
				{errorExporting}
				<TopBarMenuLink
					link="/account"
					title="Account settings"
					img="icon-profile.svg"
					imgDarkBackground
					alignRight
					action
				/>
				{creditExportLabel}
				{callToAction}
			</TopBarMenu>
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
			manager {
				id
			}
		}
	}
`;

const updatePresetBaseValues = gql`
mutation updatePresetBaseValues($id: ID!, $newValues: JSON!) {
	updatePreset(id: $id, baseValues: $newValues) {
		id
		baseValues
	}
}
`;

const deleteChoiceMutation = gql`
mutation deleteChoice($id: ID!) {
	deleteChoice(id: $id) {
		id
	}
}
`;


const deleteStepMutation = gql`
mutation deleteStep($id: ID!) {
	deleteStep(id: $id) {
		id
	}
}
`;

export default compose(
	graphql(getAcademyValuesQuery, {
		props({data}) {
			if (data.loading) {
				return {loadingAcademyProgress: true};
			}
			return {
				academyProgress: data.user.academyProgress,
				manager: data.user.manager,
			};
		},
	}),
	graphql(deleteStepMutation, {

		props: ({mutate}) => ({
			deleteStep: id =>
				mutate({
					variables: {
						id,
					},
				}),
		}),
	}),
	graphql(deleteChoiceMutation, {
		props: ({mutate}) => ({
			deleteChoice: id =>
				mutate({
					variables: {
						id,
					},
				}),
		}),
	}),
)(withCountry(Topbar));
