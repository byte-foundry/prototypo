import React from 'react';

export default class ZoomButtons extends React.Component {
	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] ZoomButtons');
		}
		return (
			<div className="zoom-buttons">
				<ZoomButton
					text="+"
					click={() => {
						this.props.plus();
					}}
				/>
				<ZoomButton
					text="-"
					click={() => {
						this.props.minus();
					}}
				/>
			</div>
		);
	}
}

class ZoomButton extends React.Component {
	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] zoom button');
		}
		return (
			<div
				className="zoom-button"
				onClick={() => {
					this.props.click();
				}}
			>
				<span>{this.props.text}</span>
			</div>
		);
	}
}
