import React from 'react';

class ContextualMenu extends React.Component {
	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] contextual menu');
		}

		const menuStyle = {
			top: this.props.pos.y,
			left: this.props.pos.x,
		};

		return this.props.show ? (
			<div className="contextual-menu" style={menuStyle}>
				<ul className="contextual-menu-list">
					{this.props.children}
				</ul>
			</div>
		) : false;
	}
}

class ContextualMenuItem extends React.Component {
	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] contextual menu item');
		}

		return (
			<li className="contextual-menu-list-item" onClick={this.props.click}>
				{this.props.text}
			</li>
		);
	}
}

export {
	ContextualMenu,
	ContextualMenuItem,
};
