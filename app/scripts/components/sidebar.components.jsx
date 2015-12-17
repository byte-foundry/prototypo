import React from 'react';

import {SideTabs, SideTab} from './side-tabs.components.jsx';
import FontControls from './font-controls.components.jsx';
import FontInfos from './font-infos.components.jsx';
import FontsCollection from './fonts-collection.components.jsx';
import Account from './account.components.jsx';
import NewsFeed from './news-feed.components.jsx';
import HelpPanel from './help-panel.components.jsx';

import LocalClient from '../stores/local-client.stores.jsx';

import {registerToUndoStack} from '../helpers/undo-stack.helpers.js';


import Remutable from 'remutable';
import Lifespan from 'lifespan';

export default class Sidebar extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();

		this.client.getStore('/sideBarTab', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({tab:head.toJS().tab});
			})
			.onDelete(() => this.setState(undefined));

		this.client.dispatchAction('/change-tab-sidebar', {name: 'sliders'});
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] Sidebar');
		}
		return (
			<div id='sidebar'>
				<SideTabs tab={this.state.tab}>
						<SideTab iconUrl="font-controls.svg" name="sliders" legend="Parameters" id="font-controls" from="customize" to="customizing">
							<FontControls />
						</SideTab>
						<SideTab iconUrl="font-infos.svg" name="font-infos" big={true} disabled={true} legend="Settings">
							<FontInfos />
						</SideTab>
						<SideTab iconUrl="fonts-collection.svg" id="font-collection" name="fonts-collection" big={true} legend="Collection" from="createFamily" to="creatingFamily">
							<FontsCollection />
						</SideTab>
						<SideTab iconUrl="admin-panel.svg" name="subscriptions" big={true} white={true} legend="Profile">
							<Account />
						</SideTab>
						<SideTab iconUrl="help-panel.svg" name="help-panel" big={true} bottom={true} padding={true} legend="Help">
							<HelpPanel/>
						</SideTab>
						<SideTab iconUrl="feed-panel.svg" name="news-feed" big={true} bottom={true} padding={true} legend="News">
							<NewsFeed />
						</SideTab>
					</SideTabs>
			</div>
		)
	}
}
