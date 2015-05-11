import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import ClassNames from 'classnames';

export default class UndoRedoMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			from:0,
			eventList: [],
		}
	}

	componentWillMount() {
		this.client = new LocalClient().instance;
		this.lifespan = new Lifespan();

		const eventBackLog = this.client.getStore('/eventBackLog',this.lifespan)
			.onUpdate(({head}) => {
				const headJs = head.toJS();
				this.setState({
					to:headJs.to,
					from:headJs.from,
					eventList:headJs.eventList,
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
		const undoDisabled = (this.state.to || this.state.from) < 2;
		const redoDisabled = (this.state.to || this.state.from) > (this.state.eventList.length - 2);
		const undoClass = ClassNames({
			'undo-redo-menu-undo-btn':true,
			'is-disabled':undoDisabled,
		});
		const redoClass = ClassNames({
			'undo-redo-menu-redo-btn':true,
			'is-disabled':redoDisabled,
		});
		return (
			<div className="undo-redo-menu">
				<div className={undoClass} onClick={() => {
					if (!undoDisabled)
						this.client.dispatchAction('/go-back');
				}}>
					<img src="assets/images/undo-arrow.png" />
				</div>
				<div className={redoClass} onClick={() => {
					if (!redoDisabled)
						this.client.dispatchAction('/go-forward');
				}}>
					<img src="assets/images/redo-arrow.png" />
				</div>
			</div>
		)
	}
}
