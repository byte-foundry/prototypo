import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import LocalClient from '../../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import classNames from 'classnames';

/**
 *	Component : the handlegrip (green bar) surrounding the letter
 *	@extends React.Component
 */
export default class HandlegripBar extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(
			this,
		);

		// function bindings
		this.handleDown = this.handleDown.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	handleDown(e) {
		if (this.props.noInteraction) {
			return;
		}
		// tells everyone that the tracking begins, and on which side
		this.client.dispatchAction('/store-value', {
			uiSpacingTracking: this.props.side,
		});

		const newX = e.pageX || e.screenX;

		this.client.dispatchAction('/store-value-fast', {
			uiTrackingX: newX,
			clampedValue: this.props.spacing - this.props.baseSpacing,
		});

		e.stopPropagation();
	}

	render() {
		const left = this.props.side === 'left';
		const handleGripClasses = classNames({
			handlegrip: true,
			'handlegrip-left': left,
			'handlegrip-right': !left,
		});

		let text
			= (this.props.clampedValue === undefined
				? this.props.spacing
				: this.props.clampedValue + this.props.baseSpacing) || '...';

		text = text instanceof Number ? text : parseInt(text);
		const offset = text - this.props.baseSpacing;

		return (
			<span
				className={handleGripClasses}
				onMouseDown={this.handleDown}
				style={this.props.style}
			>
				<span className="handlegrip-border" />
				<span className="handlegrip-spacing-number">
					{text.toFixed(0)} ({offset})
				</span>
			</span>
		);
	}
}
