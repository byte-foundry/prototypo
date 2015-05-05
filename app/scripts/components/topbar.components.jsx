import React from 'react';
import UndoRedoMenu from './undo-redo-menu.components.jsx';

export default class Topbar extends React.Component {
	render() {
		return (
			<div id="topbar">
				<UndoRedoMenu />
			</div>
		)
	}
}
