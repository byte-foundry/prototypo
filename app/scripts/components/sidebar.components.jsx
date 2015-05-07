import React from 'react';
import {SideTabs, SideTab} from './side-tabs.components.jsx';
import FontControls from './font-controls.components.jsx';
import Remutable from 'remutable';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import {registerToUndoStack} from '../helpers/undo-stack.helpers.js';

export default class Sidebar extends React.Component {

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = new LocalClient().instance;
		const server = new LocalServer().instance;

		const sideBarTab = new Remutable(this.client.getStore('/sideBarTab', this.lifespan)
			.onUpdate(({head}) => {
				this.setState(head.toJS());
			})
			.onDelete(() => this.setState(undefined)).value);


		registerToUndoStack(sideBarTab, '/sideBarTab', this.client, this.lifespan);

		server.on('action', ({path, params}) => {
			if (path == '/change-tab-sidebar') {

				const name = params.name;
				const patch = sideBarTab.set('tab',name).commit();
				server.dispatchUpdate('/sideBarTab', patch);
				this.client.dispatchAction('/store-action',{store:'/sideBarTab',patch});

			}
		}, this.lifespan);

		this.client.dispatchAction('/change-tab-sidebar',{name: 'sliders'});
	}

	render() {
		return (
			<div id='sidebar'>
				<SideTabs tab={this.state.tab}>
					<SideTab iconUrl="font-controls.png" name="sliders">
						<FontControls />
					</SideTab>
					<SideTab iconUrl="font-controls.png" name="yo">
						<div>yo</div>
					</SideTab>
				</SideTabs>
			</div>
		)
	}
}
