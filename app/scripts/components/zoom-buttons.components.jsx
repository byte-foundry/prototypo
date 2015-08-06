import React from 'react';

export default class ZoomButtons extends React.Component {
	render() {
		return (
			<div className="zoom-buttons">
				<ZoomButton text="+" click={() => { this.props.plus(); }}/>
				<ZoomButton text="-" click={() => { this.props.minus(); }}/>
			</div>
		);
	}
}

class ZoomButton extends React.Component {
	render() {
		return (
			<div className="zoom-button" onClick={() => { this.props.click(); }}>
				<span>{this.props.text}</span>
			</div>
		);
	}
}
