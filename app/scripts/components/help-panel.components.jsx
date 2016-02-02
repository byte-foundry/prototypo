import React from 'react';
import Lifespan from 'lifespan';
import ReactGeminiScrollbar from 'react-gemini-scrollbar';

import LocalClient from '../stores/local-client.stores.jsx';

//import Tutorials from './tutorials.components.jsx';

export default class HelpPanel extends React.Component {

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	saveLog() {
		this.client.dispatchAction('/save-debug-log');
	}

	render() {
		return (

			<div className="help-panel">
				<ReactGeminiScrollbar>
					<h1 className="help-panel-title side-tab-h1">Help</h1>
					<div className="help-panel-header">
						<div className="help-panel-button help-panel-button-intercom" onClick={() => { window.Intercom('show');}}>
							If you need any help or just want to say hi, come chat with us !
						</div>
						<div className="help-panel-button" onClick={() => { this.saveLog(); }}>
							Submit an event log
						</div>
					</div>
				</ReactGeminiScrollbar>
			</div>
		);
	}
}
