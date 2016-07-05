import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import classNames from 'classnames';

export default class UndoRedoMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			from: 0,
			eventList: [],
		};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] UndoRedoMenu');
		}
		const whereAt = this.state.to || this.state.from;
		const undoDisabled = whereAt < 2;
		const redoDisabled = whereAt > (this.state.eventList.length - 2);
		const undoClass = classNames({
			'undo-redo-menu-undo-btn': true,
			'is-disabled': undoDisabled,
		});
		const redoClass = classNames({
			'undo-redo-menu-redo-btn': true,
			'is-disabled': redoDisabled,
		});

		return (
			<div className="undo-redo-menu">
				<div className={undoClass} onClick={() => {
					if (!undoDisabled) {
						this.client.dispatchAction('/go-back');
					}
				}}>
					<img src="assets/images/undo-arrow.png" />
					<div className="undo-redo-menu-undo-btn-tooltip">
						Annuler {this.state.eventList.length ? this.state.eventList[whereAt].label : ''}
					</div>
				</div>
				<div className={redoClass} onClick={() => {
					if (!redoDisabled) {
						this.client.dispatchAction('/go-forward');
					}
				}}>
					<img src="assets/images/redo-arrow.png" />
					<div className="undo-redo-menu-redo-btn-tooltip">
						Rétablir {!redoDisabled ? this.state.eventList[whereAt + 1].label : ''}
					</div>
				</div>
			</div>
		);
	}
}
