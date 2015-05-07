import React from 'react';
import {ControlsTabs,ControlsTab} from './controls-tabs.components.jsx';
import Remutable from 'remutable';
import {Sliders} from './sliders.components.jsx';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import {registerToUndoStack} from '../helpers/undo-stack.helpers.js';
import {Typefaces} from '../services/typefaces.services.js';

export default class FontControls extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			tab:'functional',
		};
	}

	async componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = new LocalClient().instance;
		const server = new LocalServer().instance;

		const fontControls = await this.client.fetch('/fontControls');

		this.setState(fontControls.head.toJS());

		server.on('action', ({path, params}) => {
			if (path == '/change-tab-font') {

				const patch = fontControls.set('tab',params.name).commit();
				server.dispatchUpdate('/fontControls', patch);
				this.client.dispatchAction('/store-action',{store:'/fontControls',patch});

			}
		}, this.lifespan);

		registerToUndoStack(fontControls, '/fontControls', this.client, this.lifespan);

		this.client.getStore('/fontControls', this.lifespan)
			.onUpdate(({head}) => {
				this.setState(head.toJS());
			})
			.onDelete(() => this.setState(undefined)).value;

		this.client.dispatchAction('/change-tab-font',{name: 'functional'});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		return (
			<div className="font-controls">
				<ControlsTabs tab={this.state.tab} >
					<ControlsTab iconId="functional" name="functional">
						<Sliders params={params}/>
					</ControlsTab>
					<ControlsTab iconId="style" name="style">
						<Sliders params={paramcaca}/>
					</ControlsTab>
					<ControlsTab iconId="serif" name="serif">
						<Sliders params={paramdoublecaca}/>
					</ControlsTab>
				</ControlsTabs>
			</div>
		)
	}
}
