import React from 'react';
import Lifespan from 'lifespan';

export default class HelpPanel extends React.Component {

	async componentWillMount() {
		this.lifespan = new Lifespan();
	}

	componentDidMount() {
		let script = document.createElement("script");
		script.src = 'http://slackin.prototypo.io/slackin.js?large';
		React.findDOMNode(this.refs.slackin).appendChild(script);

		window.UserVoice.push(['addTrigger', '#contact_us', {
			mode: 'contact', // Modes: contact (default), smartvote, satisfaction
			trigger_position: 'top-right',
			trigger_color: 'white',
			trigger_background_color: '#458dd6',
			accent_color: '#458dd6'
		}]);
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		return (

			<div className="help-panel">
				<h1 className="help-panel-title side-tab-h1">Help</h1>

				<div className="help-panel-header">
					<p>
						If you want to say Hi or report an issue, join the chat room on Slack or pick up some lines with UserVoice!
					</p>
					<div className="clearfix">
						<div className="help-panel-header-slack" ref="slackin"></div>
						<div className="help-panel-header-uservoice" id="contact_us">UserVoice</div>
					</div>
				</div>

			</div>
		)
	}
}
