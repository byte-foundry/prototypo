import React from 'react';

export default class ReplayPlaylist extends React.Component {
	render() {
		return (
			<div className="replay-playlist">
				<ReplayPlayer/>
				<Events/>
			</div>
		);
	}
}

class ReplayPlayer extends React.Component {
	render() {
		return (
			<div className="replay-player">
				<div className="replay-play">
					&lt;
				</div>
				<div className="replay-pause">
					{"||"}
				</div>
			</div>
		);
	}
}

class Events extends React.Component {
	render() {
		const events = [
			<Event path="/load-app-values"/>,
			<Event path="/load-app-values"/>,
			<Event path="/load-app-values"/>,
			<Event path="/load-app-values"/>,
			<Event path="/load-app-values"/>,
			<Event path="/load-app-values"/>,
			<Event path="/load-app-values"/>,
			<Event path="/load-app-values"/>,
		];

		return (
			<ul>
				{events}
			</ul>
		);
	}
}

class Event extends React.Component {
	render() {
		return (
			<li class="event">
				<div class="event-name">
					{this.props.path}
				</div>
				<div class="event-buttons">
					<div class="event-buttons-go-here">
						Go here
					</div>
					<div class="event-buttons-details">
						Deets
					</div>
				</div>
			</li>
		)
	}
}
