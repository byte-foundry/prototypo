import React from 'react';
import Lifespan from 'lifespan';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import Log from '~/services/log.services.js';
import HoodieApi from '~/services/hoodie.services.js';

import LocalClient from '~/stores/local-client.stores.jsx';

import {
	TopBarMenu,
	TopBarMenuDropdown,
	TopBarMenuDropdownItem,
	TopBarMenuDropdownCheckBox,
	TopBarMenuAction,
	TopBarMenuIcon,
	TopBarMenuLink,
} from './top-bar-menu.components.jsx';
import AllowedTopBarWithPayment from './allowed-top-bar-with-payment.components.jsx';

export default class Topbar extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			from: 0,
			eventList: [],
			mode: [],
			export: false,
			errorExport: false,
			credits: undefined,
			plan: undefined,
			creditChoices: undefined,
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

		//function binding to avoid unnecessary re-render
		this.exportGlyphr = this.exportGlyphr.bind(this);
		this.setAccountRoute = this.setAccountRoute.bind(this);
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					mode: head.toJS().uiMode,
					export: head.toJS().export,
					errorExport: head.toJS().errorExport,
					credits: head.toJS().credits,
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

				this.client.dispatchAction('/change-param', {values: defaultParams});
			});

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

	setAccountRoute() {

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

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] Topbar');
		}
		const whereAt = this.state.to || this.state.from;
		const undoDisabled = whereAt < 2;
		const redoDisabled = whereAt > (this.state.eventList.length - 2);
		const undoText = `Undo ${this.state.eventList.length && !undoDisabled ? this.state.eventList[whereAt].label : ''}`;
		const redoText = `Redo ${!redoDisabled ? this.state.eventList[whereAt + 1].label : ''}`;
		const credits = this.state.credits;
		const freeAccount = HoodieApi.instance.plan.indexOf('free_') !== -1;
		const freeAccountAndHasCredits = (credits && credits > 0) && freeAccount;
		const otfExportCost = this.state.creditChoices ? this.state.creditChoices.exportOtf : false;
		const glyphrExportCost = this.state.creditChoices ? this.state.creditChoices.exportGlyphr : false;

		const exporting = this.state.export ? (
			<TopBarMenuAction name="Exporting..." click={() => {return;}} action={true}/>
			) : false;
		const errorExporting = this.state.errorExport ? (
			<TopBarMenuAction
				name={
					this.state.errorExport.message
					? this.state.errorExport.message
					: 'An error occured during exporting'
				}
				click={() => {return;}}
				action={true}/>
			) : false;

		const creditExportLabel = this.state.credits
			? <TopBarMenuAction name={`${this.state.credits} credits`} click={() => {return;}} action={true} alignRight={true}/>
			: false;

		return (
			<div id="topbar">
				<TopBarMenu>
					<TopBarMenuIcon className="side-tabs-icon-headers" img="assets/images/prototypo-icon.svg"/>
					<TopBarMenuDropdown name="File" id="file-menu" idMenu="file-dropdown" enter={() => { this.onboardExport('export-2'); }} leave={() => {this.onboardExport('export');}}>
						<TopBarMenuDropdownItem name="New project" handler={() => {this.newProject();}} separator={true}/>
						<AllowedTopBarWithPayment credits={credits} freeAccount={freeAccount}>
							<TopBarMenuDropdownItem
								name="Export to merged OTF"
								freeAccount={freeAccount}
								freeAccountAndHasCredits={freeAccountAndHasCredits}
								cost={otfExportCost}
								credits={this.state.credits}
								handler={() => {this.exportOTF(true);}}/>
							<TopBarMenuDropdownItem
								name="Export to merged OTF as..."
								freeAccount={freeAccount}
								freeAccountAndHasCredits={freeAccountAndHasCredits}
								cost={otfExportCost}
								credits={this.state.credits}
								handler={() => {this.setupExportAs(true);}}/>
							<TopBarMenuDropdownItem
								name="Export to OTF"
								freeAccount={freeAccount}
								freeAccountAndHasCredits={freeAccountAndHasCredits}
								cost={otfExportCost}
								credits={this.state.credits}
								handler={() => {this.exportOTF(false);}}/>
							<TopBarMenuDropdownItem
								name="Export to Glyphr Studio"
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
							handler={() => { window.open('https://chrome.google.com/webstore/detail/prototypo-web-preview/jglgljnhjnblboeonagfmfgglfdeakkf','_blank'); }}/>
						<TopBarMenuDropdownItem
							name="Logout"
							handler={() => {this.logout();}}/>
						<TopBarMenuDropdownItem
							name="Send debug log"
							handler={() => {this.client.dispatchAction('/save-debug-log');}} separator={true}/>
					</TopBarMenuDropdown>
					<TopBarMenuDropdown name="Edit">
						<TopBarMenuDropdownItem
							name="Individualize parameters"
							handler={() => { this.individualize(); }}/>
						<TopBarMenuDropdownItem
							name={undoText}
							key="undo"
							disabled={undoDisabled}
							shortcut="ctrl+z"
							handler={() => {
								if (!undoDisabled) {
									this.client.dispatchAction('/go-back');
								}
							}}/>
						<TopBarMenuDropdownItem
							name={redoText}
							key="redo"
							disabled={redoDisabled}
							shortcut="ctrl+y"
							handler={() => {
								if (!redoDisabled) {
									this.client.dispatchAction('/go-forward');
								}
							}}/>
							{/* <TopBarMenuDropdownItem name="Choose a preset" handler={() => {}}/> */}
						<TopBarMenuDropdownItem
							name="Reset all parameters"
							handler={() => { this.resetAllParams(); }}/>
					</TopBarMenuDropdown>
					<TopBarMenuDropdown name="Window">
						<TopBarMenuDropdownItem name="Glyphs list" checkbox={true} active={this.state.mode.indexOf('list') !== -1} handler={() => { this.toggleView('list'); }} separator={true}/>
						<TopBarMenuDropdownItem name="Glyph view" checkbox={true} active={this.state.mode.indexOf('glyph') !== -1} handler={() => { this.toggleView('glyph'); }}/>
						<TopBarMenuDropdownItem name="Text view" checkbox={true} active={this.state.mode.indexOf('text') !== -1} handler={() => { this.toggleView('text'); }}/>
						<TopBarMenuDropdownItem name="Word view" checkbox={true} active={this.state.mode.indexOf('word') !== -1} handler={() => { this.toggleView('word'); }}/>
					</TopBarMenuDropdown>
					<TopBarMenuDropdown name="Help">
						<TopBarMenuDropdownItem name="Chat with us!" handler={() => { window.Intercom('show');}}/>
						<TopBarMenuDropdownItem name="Submit an issue on GitHub" handler={() => { window.open('https://github.com/byte-foundry/prototypo/issues', '_blank'); }}/>
						<TopBarMenuDropdownItem name="FAQ" handler={() => { window.open('https://www.prototypo.io/faq', '_blank'); }}/>
					</TopBarMenuDropdown>
					{exporting}
					{errorExporting}
					<TopBarMenuLink link="/account" title="Account settings" img="icon-profile.svg" imgDarkBackground={true} alignRight={true} action={true}></TopBarMenuLink>
					{creditExportLabel}
				</TopBarMenu>
			</div>
		);
	}
}
