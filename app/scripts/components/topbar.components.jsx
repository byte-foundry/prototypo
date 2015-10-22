import React from 'react';
import UndoRedoMenu from './undo-redo-menu.components.jsx';
import {TopBarMenu, TopBarMenuDropdown, TopBarMenuDropdownItem, TopBarMenuDropdownCheckBox, TopBarMenuAction} from './top-bar-menu.components.jsx';
import HoodieApi from '../services/hoodie.services.js';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import Log from '../services/log.services.js';

export default class Topbar extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			from:0,
			eventList: [],
			panel: {
				mode:[],
			},
			export:{},
		}
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		const eventBackLog = this.client.getStore('/eventBackLog',this.lifespan)
			.onUpdate(({head}) => {
				const headJs = head.toJS();
				this.setState({
					to:headJs.to,
					from:headJs.from,
					eventList:headJs.eventList,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

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
		const flattenParams = _.flatten(_.map(params,(paramObject) => {
			return paramObject.parameters;
		}))
		const defaultParams = _.transform(flattenParams, (result, param) => {
			result[param.name] = param.init;
		}, {});

		this.client.dispatchAction('/change-param',{values:defaultParams, force:true});
			});

	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	logout() {
		this.client.dispatchAction('/logout');
		Log.ui('Topbar.logout');
	}

	startTuto() {
		this.client.dispatchAction('/store-panel-param',{onboard:false,onboardstep:'welcome'});
	}

	toggleView(name) {
		const newViewMode = _.xor(this.state.panel.mode,[name]);
		if (newViewMode.length > 0) {
			this.client.dispatchAction('/store-panel-param',{mode:newViewMode});
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
		const redoText = `Redo ${!redoDisabled ? this.state.eventList[whereAt+1].label : ''}`;

		const exporting = this.state.export.export ? (
			<TopBarMenuAction name="Exporting..." click={() => {}} action={true}/>
			) : false;
		const errorExporting = this.state.export.errorExport ? (
			<TopBarMenuAction name="An error occured during exporting" click={() => {}} action={true}/>
			) : false;

		return (
			<div id="topbar">
				<TopBarMenu>
					<TopBarMenuDropdown name="File" id="file-menu" idMenu="file-dropdown" enter={() => { this.onboardExport('export-2') }} leave={() => {this.onboardExport('export')}}>
						<TopBarMenuDropdownItem name="Logout" handler={() => {this.logout()}}/>
						<TopBarMenuDropdownItem name="Restart tutorial" handler={() => {this.startTuto()}}/>
						<TopBarMenuDropdownItem name="Export to merged OTF" handler={() => {this.exportOTF(true)}}/>
						<TopBarMenuDropdownItem name="Export to OTF" handler={() => {this.exportOTF(false)}}/>
						<TopBarMenuDropdownItem name="Export to Glyphr Studio" handler={this.exportGlyphr}/>
						<TopBarMenuDropdownItem name="Reset all parameters" handler={() => { this.resetAllParams() }}/>
					</TopBarMenuDropdown>
					<TopBarMenuDropdown name="Edit">
						<TopBarMenuDropdownItem name={undoText} key="undo" disabled={undoDisabled} shortcut="ctrl+z" handler={() => {
							if(!undoDisabled)
								this.client.dispatchAction('/go-back');
						}}/>
						<TopBarMenuDropdownItem name={redoText} key="redo" disabled={redoDisabled} shortcut="ctrl+y" handler={() => {
							if (!redoDisabled)
								this.client.dispatchAction('/go-forward');
						}}/>
						<TopBarMenuDropdownItem name="Choose a preset" handler={() => {}}/>
					</TopBarMenuDropdown>
					{exporting}
					{errorExporting}
					<TopBarMenuAction name="Glyphs list" click={(e) => { this.toggleView('list') }} alignRight={true} action={true}>
					</TopBarMenuAction>
					<TopBarMenuDropdown name="Toggle views" img="assets/images/views-icon.svg" alignRight={true} small={true}>
						<TopBarMenuDropdownCheckBox name="Glyph" checked={this.state.panel.mode.indexOf('glyph') !== -1} handler={() => { this.toggleView('glyph') }}/>
						<TopBarMenuDropdownCheckBox name="Text" checked={this.state.panel.mode.indexOf('text') !== -1} handler={() => { this.toggleView('text') }}/>
						<TopBarMenuDropdownCheckBox name="Word" checked={this.state.panel.mode.indexOf('word') !== -1} handler={() => { this.toggleView('word') }}/>
					</TopBarMenuDropdown>
				</TopBarMenu>
			</div>
		)
	}
}
