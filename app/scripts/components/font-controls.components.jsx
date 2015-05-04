import React from 'react';
import {ControlsTabs,ControlsTab} from './controls-tabs.components.jsx';
import Remutable from 'remutable';
import {Sliders} from './sliders.components.jsx';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import {registerToUndoStack} from '../helpers/undo-stack.helpers.js';

export default class FontControls extends React.Component {

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = new LocalClient().instance;
		const server = new LocalServer().instance;

		const fontControls = new Remutable(this.client.getStore('/fontControls', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({fontControls: head.toJS()});
			})
			.onDelete(() => this.setState({fontControls: undefined})).value);

		registerToUndoStack(fontControls,'/fontControls',this.client,this.lifespan);


		server.on('action', ({path, params}) => {
			if (path == '/change-tab') {

				const name = params.name;
				const patch = fontControls.set('tab',name).commit();
				server.dispatchUpdate('/fontControls', patch);
				this.client.dispatchAction('/store-action',{store:'/fontControls',patch});

			}
		}, this.lifespan);

		this.client.dispatchAction('/change-tab',{name: 'functional'});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		const params = [
			{
				title:"Thickness",
				value:57,
			},
			{
				title:"Thickness",
				value:57,
			},
			{
				title:"Thickness",
				value:57,
			},
			{
				title:"Thickness",
				value:57,
			}
		];

		return (
			<div class="font-controls">
				<ControlsTabs tab={this.state.fontControls.tab} >
					<ControlsTab iconId="functional" name="functional">
						<Sliders params={params}/>
					</ControlsTab>
					<ControlsTab iconId="style" name="style">
						<Sliders params={params}/>
					</ControlsTab>
					<ControlsTab iconId="serif" name="serif">
						<Sliders params={params}/>
					</ControlsTab>
				</ControlsTabs>
			</div>
		)
	}
}
