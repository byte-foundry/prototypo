import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ClassNames from 'classnames';

class ContextualMenu extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] contextual menu');
		}

		const classes = ClassNames({
			'contextual-menu': true,
			'is-aligned-left': this.props.alignLeft,
		});

		return (
			<div className={classes}>
				<ul className="contextual-menu-list">
					{this.props.children}
				</ul>
			</div>
		);
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
		const classes = ClassNames({
			'contextual-menu-list-item': true,
			'is-active': this.props.active,
			'is-split': this.props.splitted,
			'clearfix': this.props.splitted,
		});
		if (this.props.splitted) {
			return (
				<li className={classes}>
					<div className="btn danger" onClick={this.props.click}>
						<span>{this.props.text}</span>
					</div>
					<div className="btn" onClick={this.props.altClick}>
						<span>{this.props.altLabel}</span>
					</div>
				</li>
			);
		}
		else {
			return (
				<li className={classes} onClick={this.props.click}>
					{this.props.text}
				</li>
			);
		}
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
