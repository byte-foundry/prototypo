import React from 'react';
import {SideTabs, SideTab} from './side-tabs.components.jsx';
import FontControls from './font-controls.components.jsx';

export default class Sidebar extends React.Component {

	render() {
		return (
			<div id='sidebar'>
				<SideTabs>
					<SideTab iconUrl="font-controls.png">
						<FontControls />
					</SideTab>
				</SideTabs>
			</div>
		)
	}
}
