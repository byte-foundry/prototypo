import React from 'react';

import {SideTabs, SideTab} from './side-tabs.components.jsx';
import FontControls from './font-controls.components.jsx';
import Subscriptions from './subscriptions.components.jsx';

import LocalClient from '../stores/local-client.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';

import {registerToUndoStack} from '../helpers/undo-stack.helpers.js';

import Remutable from 'remutable';
import Lifespan from 'lifespan';

export default class Sidebar extends React.Component {

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
		const server = new LocalServer().instance;

		const sideBarTab = new Remutable(this.client.getStore('/sideBarTab', this.lifespan)
			.onUpdate(({head}) => {
				this.setState(head.toJS());
			})
			.onDelete(() => this.setState(undefined)).value);

		server.on('action', ({path, params}) => {
			if (path == '/change-tab-sidebar') {

				const name = params.name;
				const patch = sideBarTab.set('tab',name).commit();
				server.dispatchUpdate('/sideBarTab', patch);
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
					<SideTab iconUrl="font-controls.png" name="yo" big={true}>
						<Subscriptions />
					</SideTab>
				</SideTabs>
			</div>
		)
	}
}
