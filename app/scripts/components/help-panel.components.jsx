import React from 'react';
import Lifespan from 'lifespan';
import ReactGeminiScrollbar from 'react-gemini-scrollbar';

import Tutorials from './tutorials.components.jsx';

export default class HelpPanel extends React.Component {

	async componentWillMount() {
		this.lifespan = new Lifespan();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		return (

			<div className="help-panel">
				<ReactGeminiScrollbar>
					<h1 className="help-panel-title side-tab-h1">Help</h1>
					<div className="help-panel-header">
						<div className="help-panel-button" onClick={() => { window.Intercom('show');}}>
							If you need any help or just want to say hi, come chat with us !
						</div>
						<div className="help-panel-button">
							Submit an event log
						</div>
					</div>
					<Tutorials />
				</ReactGeminiScrollbar>
			</div>
		)
	}
}
