import {filter} from 'graphql-anywhere';
import gql from 'graphql-tag';
import _xor from 'lodash/xor';
import _flatten from 'lodash/flatten';
import _map from 'lodash/map';
import _transform from 'lodash/transform';
import _cloneDeep from 'lodash/cloneDeep';
import React from 'react';
import {Query, graphql, compose} from 'react-apollo';
import {withRouter} from 'react-router';
import Lifespan from 'lifespan';

import Log from '../../services/log.services';

import LocalClient from '../../stores/local-client.stores';

import {
	indivGroupsCreationTutorialLabel,
	fileTutorialLabel,
	collectionsTutorialLabel,
} from '../../helpers/joyride.helpers';

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
import TopBarAcademy from './top-bar-academy.components';
import AllowedTopBarWithPayment from './allowed-top-bar-with-payment.components';

import {libraryQuery, presetQuery} from '../library/library-main.components';

const GET_NETWORK_STATUS = gql`
	query getNetworkStatus {
		networkStatus @client {
			isConnected
		}
	}
`;

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
			at: -1,
			advancedMode: false,
		};

		// function binding to avoid unnecessary re-render
		this.exportGlyphr = this.exportGlyphr.bind(this);
		this.exportAs = this.exportAs.bind(this);
		this.exportMergedOTF = this.exportMergedOTF.bind(this);
		this.exportFamily = this.exportFamily.bind(this);
		this.individualize = this.individualize.bind(this);
		this.goToSubscribe = this.goToSubscribe.bind(this);
		this.resetFileTutorial = this.resetFileTutorial.bind(this);
		this.resetCollectionTutorial = this.resetCollectionTutorial.bind(this);
		this.resetIndivTutorial = this.resetIndivTutorial.bind(this);
		this.showAcademy = this.showAcademy.bind(this);
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
					topbarItemDisplayed: head.toJS().d.topbarItemDisplayed,
					advancedMode: head.toJS().d.advancedMode,
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

	exportGlyphr() {
		this.client.dispatchAction('/export-glyphr');
		Log.ui('Topbar.exportGlyphr');
	}

	exportFamily() {
		this.client.dispatchAction('/export-family');
		Log.ui('Topbar.exportFamily');
	}

	async resetAllParams() {
		const store = await this.client.fetch('/prototypoStore');
		const undoableStore = await this.client.fetch('/undoableStore');
		const currentFamily = store.head.toJS().family;
		const currentValues = undoableStore.head.toJS().controlsValues;
		const fontParameters = store.head.toJS().fontParameters;

		const family = this.props.families.find(f => f.id === currentFamily.id);
		let newValues;

		if (family.from) {
			if (family.from.type === 'PRESET') {
				newValues = _cloneDeep(
					this.props.presets.find(p => p.id === family.from.preset.id)
						.baseValues,
				);
			}
			if (family.from.type === 'VARIANT') {
				newValues = _cloneDeep(
					this.props.families
						.find(f => f.id === family.from.variant.family.id)
						.variants.find(v => v.id === family.from.variant.id).values,
				);
			}
		}
		else {
			const flattenParams = _flatten(
				_map(fontParameters, paramObject => paramObject.parameters),
			);

			newValues = _transform(
				flattenParams,
				(result, param) => {
					result[param.name] = param.init;
				},
				{},
			);
		}

		newValues.postDepManualChanges = currentValues.postDepManualChanges;
		newValues.altList = currentValues.altList;
		newValues.glyphSpecialProps = currentValues.glyphSpecialProps;
		newValues.glyphComponentChoice = currentValues.glyphComponentChoice;
		newValues.indiv_glyphs = currentValues.indiv_glyphs;
		newValues.indiv_group_param = currentValues.indiv_group_param;

		this.client.dispatchAction('/change-param', {
			values: newValues,
			demo: true,
			force: true,
		});
	}

	async resetAllChanges() {
		const store = await this.client.fetch('/prototypoStore');
		const undoableStore = await this.client.fetch('/undoableStore');
		const currentFamily = store.head.toJS().family;
		const currentValues = undoableStore.head.toJS().controlsValues;
		const fontParameters = store.head.toJS().fontParameters;

		const family = this.props.families.find(f => f.id === currentFamily.id);
		let newValues;

		if (family.from) {
			if (family.from.type === 'PRESET') {
				newValues = _cloneDeep(
					this.props.presets.find(p => p.id === family.from.preset.id)
						.baseValues,
				);
			}
			if (family.from.type === 'VARIANT') {
				newValues = _cloneDeep(
					this.props.families
						.find(f => f.id === family.from.variant.family.id)
						.variants.find(v => v.id === family.from.variant.id).values,
				);
			}
		}
		else {
			const flattenParams = _flatten(
				_map(fontParameters, paramObject => paramObject.parameters),
			);

			newValues = _transform(
				flattenParams,
				(result, param) => {
					result[param.name] = param.init;
				},
				{},
			);
		}
		newValues.postDepManualChanges = newValues.manualChanges || {};
		newValues.indiv_glyphs = currentValues.indiv_glyphs;
		newValues.indiv_group_param = currentValues.indiv_group_param;

		this.client.dispatchAction('/change-param', {
			values: newValues,
			demo: true,
			force: true,
		});
	}

	newProject() {
		this.props.history.push('/library/create');
	}

	startTuto() {
		this.client.dispatchAction('/store-value', {
			uiOnboard: false,
			uiOnboardstep: 'welcome',
		});
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
		this.client.dispatchAction('/store-value', {
			openGoProModal: true,
			goProModalBilling: 'annually',
		});
	}

	resetFileTutorial(e) {
		e.stopPropagation();
		e.preventDefault();
		this.client.dispatchAction('/store-value', {firstTimeFile: true});
		this.client.dispatchAction('/store-value', {
			uiJoyrideTutorialValue: fileTutorialLabel,
		});
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
		this.client.dispatchAction('/store-value', {
			firstTimeIndivCreate: true,
		});
		this.client.dispatchAction('/store-value', {
			uiJoyrideTutorialValue: indivGroupsCreationTutorialLabel,
		});
		if (!this.state.indiv) {
			this.client.dispatchAction('/toggle-individualize');
		}
	}

	showAcademy() {
		this.props.history.push('/academy');
	}

	exportOTF(merged) {
		this.client.dispatchAction('/export-otf', {merged});
		Log.ui('Topbar.exportOTF', merged ? 'merged' : 'not merged');
	}

	startFileTutorial() {
		this.client.dispatchAction('/store-value', {
			uiJoyrideTutorialValue: fileTutorialLabel,
		});
	}

	render() {
		const {loading, user, user: {subscription} = {}} = this.props;
		const {advancedMode} = this.state;
		const whereAt = this.state.at || 0;
		const undoDisabled = whereAt < 0;
		const redoDisabled = whereAt > this.state.eventList.length - 2;
		const undoText = `Undo ${
			this.state.eventList.length && !undoDisabled
				? this.state.eventList[whereAt].label
				: ''
		}`;
		const redoText = `Redo ${
			redoDisabled ? '' : this.state.eventList[whereAt + 1].label
		}`;
		const credits = this.state.credits; // eslint-disable-line prefer-destructuring
		const freeAccount = !this.props.manager && !subscription;
		const otfExportCost = this.state.creditChoices
			? this.state.creditChoices.exportOtf
			: 0;
		const glyphrExportCost = this.state.creditChoices
			? this.state.creditChoices.exportGlyphr
			: 0;

		const exporting = this.state.export && 'Exporting...';
		const errorExporting
			= this.state.errorExport
			&& (this.state.errorExport.message
				? this.state.errorExport.message
				: 'An error occured during exporting');

		const notificationMessage = exporting || errorExporting || null;

		const creditExportLabel = !!this.state.credits && (
			<TopBarMenuAction
				name={`${this.state.credits} credits`}
				click={() => {}}
				action
				alignRight
			/>
		);
		const callToAction = !(credits > 0 || !freeAccount) && (
			<TopBarMenuButton
				label={
					<span>
						GET THE FULL VERSION FROM{' '}
						<Price amount={8.25} country={this.props.country} />
					</span>
				}
				noHover
				centered
				click={this.goToSubscribe}
				alignRight
			/>
		);

		return (
			<TopBarMenu
				id="topbar"
				topbarItemDisplayed={this.state.topbarItemDisplayed}
			>
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
							cost={glyphrExportCost}
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
								this.client.dispatchAction('/go-back', {
									eventIndex: this.state.at,
								});
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
								this.client.dispatchAction('/go-forward', {
									eventIndex: this.state.at,
								});
							}
						}}
					/>
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
					<TopBarMenuDropdownItem
						name={`${
							advancedMode ? 'Deactivate' : 'Activate'
						} experimental mode`}
						handler={() => {
							this.client.dispatchAction('/store-value', {
								advancedMode: !advancedMode,
							});
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
					<TopBarMenuDropdownItem
						name="Academy"
						id="access-academy"
						handler={this.showAcademy}
					/>
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
				<TopBarAcademy
					id="progress-academy"
					headerClassName="no-hover"
					isIndiv={this.state.indiv}
					{...(loading ? {} : filter(TopBarAcademy.fragments.user, user))}
				/>
				<TopBarMenuLink
					link="/account"
					title="Account settings"
					img="icon-profile.svg"
					imgDarkBackground
					alignRight
					action
				/>
				<Query query={GET_NETWORK_STATUS} ignoreParent>
					{({loadingNetwork, data: {networkStatus}}) => {
						const offlineMessage
							= !loadingNetwork && !networkStatus.isConnected
								? 'Network has been lost'
								: null;

						if (notificationMessage || offlineMessage) {
							return (
								<li className="top-bar-menu-item no-hover is-aligned-right">
									{notificationMessage || offlineMessage}
								</li>
							);
						}

						return null;
					}}
				</Query>
				{creditExportLabel}
				{callToAction}
			</TopBarMenu>
		);
	}
}

const GET_USER_TOP_BAR_VALUES = gql`
	query getUserTopBarValues {
		user {
			id
			subscription @client {
				id
				plan {
					id
				}
			}
			manager {
				id
			}

			...AcademyUserValues
		}
	}

	${TopBarAcademy.fragments.user}
`;

export default compose(
	graphql(GET_USER_TOP_BAR_VALUES, {
		fetchPolicy: 'network-only',
		props({data}) {
			if (data.loading) {
				return {loading: true};
			}

			return {user: data.user};
		},
	}),
	graphql(presetQuery, {
		options: {
			fetchPolicy: 'cache-first',
		},
		props: ({data}) => {
			if (data.loading) {
				return {loading: true};
			}

			if (data.allPresets) {
				return {
					presets: data.allPresets,
				};
			}
		},
	}),
	graphql(libraryQuery, {
		options: {
			fetchPolicy: 'cache-first',
		},
		props: ({data}) => {
			if (data.loading) {
				return {loading: true};
			}

			if (data.user) {
				return {
					families: data.user.library,
					refetch: data.refetch,
				};
			}

			return {refetch: data.refetch};
		},
	}),
)(withCountry(withRouter(Topbar)));
