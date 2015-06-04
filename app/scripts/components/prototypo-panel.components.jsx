import React from 'react';
import PrototypoText from './prototypo-text.components.jsx';

export default class PrototypoPanel extends React.Component {
	render() {
		return (
			<div id="prototypopanel">
				<PrototypoText fontName={this.props.fontName}/>
			</div>
		)
	}
}
