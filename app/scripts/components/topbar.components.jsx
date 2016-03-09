import React from 'react';
import Lifespan from 'lifespan';

import Log from '../services/log.services.js';
import HoodieApi from '../services/hoodie.services.js';

import LocalClient from '../stores/local-client.stores.jsx';

import {TopBarMenu, TopBarMenuDropdown, TopBarMenuDropdownItem, TopBarMenuDropdownCheckBox, TopBarMenuAction} from './top-bar-menu.components.jsx';

export default class Topbar extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			from: 0,
			eventList: [],
			panel: {
				mode: [],
			},
			export: {},
		};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/panel', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					panel: head.toJS(),
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client.getStore('/exportStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					export: head.toJS(),
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	exportOTF(merged) {
		this.client.dispatchAction('/export-otf', {merged});
		Log.ui('Topbar.exportOTF', merged ? 'merged' : 'not merged');
	}

	exportGlyphr() {
		fontInstance.openInGlyphr();
		Log.ui('Topbar.exportGlyphr');
	}

	resetAllParams() {
		//const typedata = await this.client.fetch('/fontParameters');
		//
		this.client.fetch('/fontParameters')
			.then((typedata) => {
				const params = typedata.head.toJS().parameters;
				const flattenParams = _.flatten(_.map(params, (paramObject) => {
					return paramObject.parameters;
				}));
				const defaultParams = _.transform(flattenParams, (result, param) => {
					result[param.name] = param.init;
				}, {});

				this.client.dispatchAction('/change-param', {values: defaultParams, force: true});
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
		this.client.dispatchAction('/change-tab-sidebar', {name: 'fonts-collection'});
		Log.ui('Topbar.logout');
	}

	startTuto() {
		this.client.dispatchAction('/store-panel-param', {onboard: false, onboardstep: 'welcome'});
	}

	individualize() {
		this.client.dispatchAction('/toggle-individualize');
	}

	toggleView(name) {
		const newViewMode = _.xor(this.state.panel.mode, [name]);

		if (newViewMode.length > 0) {
			this.client.dispatchAction('/store-panel-param', {mode: newViewMode});
			Log.ui('Topbar.toggleView', name);
		}
	}

	async onboardExport(step) {
		const panel = await this.client.fetch('/panel');

		if (panel.get('onboard')) {
			return;
		}

		const currentStep = panel.get('onboardstep');

		if (currentStep === 'export' && step === 'export-2') {
			this.client.dispatchAction('/store-panel-param', {onboardstep: step});
		}
		else if (currentStep === 'export-2' && step === 'export') {
			this.client.dispatchAction('/store-panel-param', {onboardstep: step});
		}
		else if (currentStep === 'premature-end') {
			this.client.dispatchAction('/store-panel-param', {onboard: true});
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

		const exporting = this.state.export.export ? (
			<TopBarMenuAction name="Exporting..." click={() => {return;}} action={true}/>
			) : false;
		const errorExporting = this.state.export.errorExport ? (
			<TopBarMenuAction name="An error occured during exporting" click={() => {return;}} action={true}/>
			) : false;

		return (
			<div id="topbar">
				<TopBarMenu>
					<TopBarMenuDropdown name="File" id="file-menu" idMenu="file-dropdown" enter={() => { this.onboardExport('export-2'); }} leave={() => {this.onboardExport('export');}}>
						<TopBarMenuDropdownItem name="Restart tutorial" handler={() => {this.startTuto();}} separator={true}/>
						<TopBarMenuDropdownItem name="New project" handler={() => {this.newProject();}} separator={true}/>
						<TopBarMenuDropdownItem name="Export to merged OTF" handler={() => {this.exportOTF(true);}}/>
						<TopBarMenuDropdownItem name="Export to OTF" handler={() => {this.exportOTF(false);}}/>
						<TopBarMenuDropdownItem name="Export to Glyphr Studio" handler={this.exportGlyphr} separator={true}/>
						<TopBarMenuDropdownItem name="Logout" handler={() => {this.logout();}}/>
					</TopBarMenuDropdown>
					<TopBarMenuDropdown name="Edit">
						<TopBarMenuDropdownItem name="Individualize parameters" handler={() => { this.individualize(); }}/>
						<TopBarMenuDropdownItem name={undoText} key="undo" disabled={undoDisabled} shortcut="ctrl+z" handler={() => {
							if (!undoDisabled) {
								this.client.dispatchAction('/go-back');
							}
						}}/>
						<TopBarMenuDropdownItem name={redoText} key="redo" disabled={redoDisabled} shortcut="ctrl+y" handler={() => {
							if (!redoDisabled) {
								this.client.dispatchAction('/go-forward');
							}
						}}/>
						{/* <TopBarMenuDropdownItem name="Choose a preset" handler={() => {}}/> */}
						<TopBarMenuDropdownItem name="Reset all parameters" handler={() => { this.resetAllParams(); }}/>
					</TopBarMenuDropdown>
					<TopBarMenuDropdown name="Window">
						<TopBarMenuDropdownItem name="Glyphs list" checkbox={true} active={this.state.panel.mode.indexOf('list') !== -1} handler={() => { this.toggleView('list'); }} separator={true}/>
						<TopBarMenuDropdownItem name="Glyph view" checkbox={true} active={this.state.panel.mode.indexOf('glyph') !== -1} handler={() => { this.toggleView('glyph'); }}/>
						<TopBarMenuDropdownItem name="Text view" checkbox={true} active={this.state.panel.mode.indexOf('text') !== -1} handler={() => { this.toggleView('text'); }}/>
						<TopBarMenuDropdownItem name="Word view" checkbox={true} active={this.state.panel.mode.indexOf('word') !== -1} handler={() => { this.toggleView('word'); }}/>
					</TopBarMenuDropdown>
					<TopBarMenuDropdown name="Help">
						<TopBarMenuDropdownItem name="Chat with us!" handler={() => { window.Intercom('show');}}/>
						<TopBarMenuDropdownItem name="Submit an issue on GitHub" handler={() => { window.open('https://github.com/byte-foundry/prototypo/issues','_blank'); }}/>
						<TopBarMenuDropdownItem name="FAQ" handler={() => { window.open('https://www.prototypo.io/faq','_blank'); }}/>
					</TopBarMenuDropdown>
					{exporting}
					{errorExporting}

					<TopBarMenuAction name="Glyphs list" click={() => { this.toggleView('list'); }} alignRight={true} action={true}></TopBarMenuAction>

					<TopBarMenuAction name="text" click={() => { this.toggleView('text'); }} active={this.state.panel.mode.indexOf('text') !== -1} img="view-text.svg" alignRight={true} small={true}></TopBarMenuAction>
					<TopBarMenuAction name="word" click={() => { this.toggleView('word'); }} active={this.state.panel.mode.indexOf('word') !== -1} img="view-word.svg" alignRight={true} small={true}></TopBarMenuAction>
					<TopBarMenuAction name="glyph" click={() => { this.toggleView('glyph'); }} active={this.state.panel.mode.indexOf('glyph') !== -1} img="view-glyph.svg" alignRight={true} small={true}></TopBarMenuAction>

				</TopBarMenu>
			</div>
		);
	}
}
