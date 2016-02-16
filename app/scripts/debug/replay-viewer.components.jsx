import React from 'react';

import Dashboard from '../components/dashboard.components.jsx';
import ReplayPlaylist from './replay-playlist.components.jsx';

export default class ReplayViewer extends React.Component {
	render() {
		return (
			<div className="replay-container">
				<Dashboard />
				<ReplayPlaylist />
			</div>
		);
	}
}
