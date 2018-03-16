import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import Lifespan from 'lifespan';

import LocalClient from '../../stores/local-client.stores.jsx';

import CanvasBarButton from './canvas-bar-button.components.jsx';

export default class CanvasBar extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
		this.chooseMode = this.chooseMode.bind(this);
		this.state = {};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					canvasMode: head.toJS().d.canvasMode,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	chooseMode(mode) {
		this.client.dispatchAction('/change-canvas-mode', {canvasMode: mode});
	}

	render() {
		const buttons = ['move', 'components', 'select-points', 'shadow', 'component-magic'].map(item => <CanvasBarButton name={item} key={item} active={item === this.state.canvasMode} click={this.chooseMode} />);

		return (
			<div className="canvas-bar">
				{buttons}
			</div>
		);
	}
}
