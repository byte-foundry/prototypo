import React from 'react';
import Lifespan from 'lifespan';
import Classnames from 'classnames';
import ScrollArea from 'react-scrollbar';
import JSONPretty from 'react-json-pretty';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import LocalClient from '../stores/local-client.stores.jsx';

export default class ReplayPlaylist extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
		.onUpdate(({head}) => {
				this.setState({
					debugDetails: head.toJS().debugDetails,
					debugShowDetails: head.toJS().debugShowDetails,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		const details = this.state.debugShowDetails
			? <EventDetails details={this.state.debugDetails} />
			: false;

		return (
			<div className="replay-playlist">
				<ReplayPlayer/>
				<Events/>
				{details}
			</div>
		);
	}
}

class ReplayPlayer extends React.Component {
	render() {
		return (
			<div className="replay-player">
				<div className="replay-player-play">
					&lt;
				</div>
				<div className="replay-player-pause">
					{"||"}
				</div>
			</div>
		);
	}
}

class Events extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
		.onUpdate(({head}) => {
				this.setState({
					patchArray: head.toJS().patchArray,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		let eventIndex = 0;
		const events = _.map(this.state.patchArray, (patch, i) => {
			if (patch.type === 'action') {
				return <Event path={patch.path} details={patch.params} index={eventIndex++} key={i}/>;
			}
			else {
				return <Patch path={patch.path} details={patch.patch} key={i}/>
			}
		});

		return (
			<ScrollArea horizontal={false}>
			<ul className="events">
				{events}
				</ul>
			</ScrollArea>
		);
	}
}

class Patch extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		const classes = Classnames({
			event: true,
			patch: true,
		});

		return (
			<li className={classes}>
				<div className="event-name patch-name">
					{this.props.path}
				</div>
				<div className="event-buttons">
					<div className="event-buttons-go-here">
						Go here
					</div>
					<div className="event-buttons-details">
						Deets
					</div>
				</div>
			</li>
		);
	}
}

class Event extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
		.onUpdate(({head}) => {
				this.setState({
					debugIndex: head.toJS().debugIndex,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	showDetails() {
		this.client.dispatchAction('/show-details', this.props.details);
	}

	render() {
		const classes = Classnames({
			event: true,
			'is-active': this.props.index === this.state.debugIndex,
		});

		return (
			<li className={classes}>
				<div className="event-name">
					{this.props.path}
				</div>
				<div className="event-buttons">
					<div className="event-buttons-go-here">
						Go here
					</div>
					<div className="event-buttons-details" onClick={() => {this.showDetails();}}>
						Deets
					</div>
				</div>
			</li>
		);
	}
}

class EventDetails extends React.Component {
	componentWillMount() {
		this.client = LocalClient.instance();
	}

	closeDetails() {
		this.client.dispatchAction('close-details');
	}

	render() {
		return (
			<div className="event-details">
				<h1 className="event-details-title">Action details</h1>
				<div className="event-details-close" onClick={() => {this.closeDetails()}}>Close</div>
				<ScrollArea>
					<JSONPretty json={this.props.details}></JSONPretty>
				</ScrollArea>
			</div>
		)
	}
}
