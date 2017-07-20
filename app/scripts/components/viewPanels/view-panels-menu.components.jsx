import React from 'react';
import ClassNames from 'classnames';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import onClickOutside from 'react-onclickoutside';
import {ContextualMenu} from './contextual-menu.components.jsx';

class ViewPanelsMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = { };
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	handleClickOutside(evt) {
	    if (this && this.props.show) {
			this.props.toggle(evt);
	    }
	}

	render() {
		const iconClasses = ClassNames({
			'view-panels-menu-icon': true,
			'is-active': this.props.show,
		});

		const textClasses = ClassNames({
			'view-panels-menu-text': true,
			'is-active': this.props.show,
		});

		const classes = ClassNames({
			'view-panels-menu': true,
			'is-aligned-left': this.props.alignLeft,
			'is-wide-right': this.props.wideRight,
			'is-shifted': this.props.shifted,
			'textpanel-closed': this.props.textPanelClosed,
			'is-intercom-shift': this.props.intercomShift,
		});

		const menu = this.props.show
			? (
				<ContextualMenu key={1} alignLeft={this.props.alignLeft}>
					{this.props.children}
				</ContextualMenu>
			)
			: false;

		const button = this.props.text
			? <div className={textClasses} onClick={this.props.toggle}>{this.props.text}</div>
			: <div className={iconClasses} onClick={this.props.toggle}></div>;

		return (
			<div className={classes}>
				{button}
				<ReactCSSTransitionGroup
					component="span"
					className="settings-menu-toolbox"
					transitionName="contextual-menu"
					transitionEnterTimeout={200}
					transitionLeaveTimeout={200}>
					{menu}
				</ReactCSSTransitionGroup>
			</div>
		);
	}
}

export default onClickOutside(ViewPanelsMenu);
