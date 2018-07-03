import React from 'react';
import Lifespan from 'lifespan';

import LocalClient from '../../stores/local-client.stores.jsx';

import CanvasBarButton from './canvas-bar-button.components.jsx';

export default class CanvasBar extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {};

		this.chooseMode = this.chooseMode.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client
			.getStore('/prototypoStore', this.lifespan)
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
		const buttons = ['move', 'components', 'select-points', 'shadow'].map(
			item => (
				<CanvasBarButton
					name={item}
					key={item}
					active={item === this.state.canvasMode}
					click={this.chooseMode}
				/>
			),
		);

		return <div className="canvas-bar">{buttons}</div>;
	}
}
