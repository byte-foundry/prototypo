import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';

export default class UndoRedoMenu extends React.Component {

	componentWillMount() {
		this.client = new LocalClient().instance;

	}

	render() {
		return (
			<div className="undo-redo-menu">
				<div className="undo-redo-menu-undo-btn" onClick={() => {
					this.client.dispatchAction('/go-back');
				}}>
					<img src="assets/images/undo-arrow.png" />
				</div>
				<div className="undo-redo-menu-redo-btn" onClick={() => {
					this.client.dispatchAction('/go-forward');
				}}>
					<img src="assets/images/redo-arrow.png" />
				</div>
			</div>
		)
	}
}
