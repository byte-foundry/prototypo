import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

class ContextualMenu extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

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
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

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

class ContextualMenuDropDown extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		return (
			<li className="contextual-menu-list-item with-dropdown" onClick={this.props.click}>
				{this.props.text}
				<ul className="contextual-menu-list-item-dropdown">
					{this.props.options}
				</ul>
			</li>
		);
	}
}

export {
	ContextualMenu,
	ContextualMenuItem,
	ContextualMenuDropDown,
};
