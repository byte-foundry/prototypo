import React from 'react';
import ArianneThread from './arianne-thread.components.jsx';
import IndivSwitch from './arianne-thread.components.jsx';
import ViewsButtons from './arianne-thread.components.jsx';

export default class Toolbar extends React.Component {
	render() {
		return (
			<div className="toolbar">
				<div className="toolbar-left">
					<ArianneThread />
				</div>
				<div className="toolbar-right">
				</div>
			</div>
		);
	}
}
