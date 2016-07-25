import React from 'react';
import classNames from 'classnames';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {Link} from 'react-router';
import Lifespan from 'lifespan';
import LocalClient from '~/stores/local-client.stores.jsx';

import CheckBoxWithImg from '../checkbox-with-img.components.jsx';

class TopBarMenu extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] TopBarMenu');
		}
		const headers = _.without(this.props.children, false).map((child, index) => {
			const classes = classNames({
				'top-bar-menu-item': true,
				'is-aligned-right': child.props.alignRight,
				'is-action': child.props.action,
				'is-icon-menu': !!child.props.img,
				'img-dark-background': child.props.imgDarkBackground,
			});

			return (
				<TopBarMenuItem
					className={classes}
					key={child.props.name || child.props.img}
					id={child.props.id}
					count={index}
					onMouseEnter={child.props.enter}
					onMouseLeave={child.props.leave}>
					{child.type.getHeader(child.props)}
					{child}
				</TopBarMenuItem>
			);
		});

		return (
			<ul className="top-bar-menu">
				{headers}
			</ul>
		);
	}
}

class TopBarMenuItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			topbarItemDisplayed: undefined,
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

		// function binding
		this.toggleDisplay = this.toggleDisplay.bind(this);
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		const {head} = await this.client.fetch('/prototypoStore');

		this.setState({
			topbarItemDisplayed: head.toJS().topbarItemDisplayed,
		});

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					topbarItemDisplayed: head.toJS().topbarItemDisplayed,
				});
			})
			.onDelete(() => {
				this.setState({
					topbarItemDisplayed: undefined,
				});
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	toggleDisplay() {
		if (this.state.topbarItemDisplayed === this.props.count) {
			this.client.dispatchAction('/store-value', {
				topbarItemDisplayed: undefined,
			});
		}
		else {
			this.client.dispatchAction('/store-value', {
				topbarItemDisplayed: this.props.count,
			});

			const selector = '.toolbar, #workboard';
			const outsideClick = () => {
				this.client.dispatchAction('/store-value', {
					topbarItemDisplayed: undefined,
				});
				document.querySelectorAll(selector).forEach((item) => {
					item.removeEventListener('click', outsideClick);
				});
			};

			document.querySelectorAll(selector).forEach((item) => {
				item.addEventListener('click', outsideClick);
			});
		}
	}

	render() {
		const classes = classNames(this.props.className, {
			'topbaritem-displayed': this.state.topbarItemDisplayed === this.props.count,
		});

		return (
			<li
				className={classes}
				id={`topbar-menu-item-${this.props.count}`}
				onClick={this.toggleDisplay}>
				{this.props.children}
			</li>
		);
	}
}

class TopBarMenuDropdown extends React.Component {
	static getHeader(props) {
		const content = {
			'title': props.name ? <span className="top-bar-menu-item-title" key={`titleheader${props.name}`}>{props.name}</span> : false,
			'img': props.img ? <img className="top-bar-menu-item-img" src={props.img} key={`imgheader${props.name}`}>{props.name}</img> : false,
		};

		return [content.title, content.img];
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] topbarmenudropdown');
		}
		const classes = classNames({
			'top-bar-menu-item-dropdown': true,
			'is-small': this.props.small,
		});

		return (
			<ul className={classes} id={this.props.idMenu}>
				{this.props.children}
			</ul>
		);
	}
}

class TopBarMenuAction extends React.Component {

	static getHeader(props) {

		const classes = classNames({
			'top-bar-menu-item-action': true,
			'is-active': props.active,
		});

		if (props.img) {
			return <div className={classes} title={`Toggle ${props.name} view`} onClick={(e) => {props.click(e);}}><img src={`assets/images/${props.img}`} /></div>;
		}
		else {
			return <div className={classes} onClick={(e) => {props.click(e);}}>{props.name}</div>;
		}
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] topbarMenuAction');
		}
		return false;
	}
}

class TopBarMenuLink extends React.Component {

	static getHeader(props) {

		const classes = classNames({
			'top-bar-menu-item-action': true,
			'is-active': props.active,
			'is-image-action': !!props.img,
		});
		const linkClassName = classNames({
			'top-bar-menu-link': true,
		});

		if (props.img) {
			return (
				<div className={classes}>
					<Link to="/account" className={linkClassName} >
						<img src={`assets/images/${props.img}`} />
					</Link>
				</div>
			);
		}
		else {
			return (
				<div className={classes}>
					<Link to="/account" className={linkClassName} title={props.title}>
						{props.name}
					</Link>
				</div>
			);
		}
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] topbarMenuAction');
		}
		return false;
	}
}


function setupKeyboardShortcut(key, modifier, cb) {
	document.addEventListener('keydown', (e) => {
		if ((!modifier || e[`${modifier}Key`]) && e.keyCode === key.toUpperCase().charCodeAt(0)) {
			cb();
		}
	});
}

class TopBarMenuDropdownItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			exporting: undefined,
		};

		//function bindings
		this.handleClick = this.handleClick.bind(this);
	}

	shouldComponentUpdate(newProps, newState) {
		return (
			this.props.name !== newProps.name
			|| this.props.shortcut !== newProps.shortcut
			|| this.props.handler !== newProps.handler
			|| this.props.creditsAltLabel !== newProps.creditsAltLabel
			|| this.props.freeAccount !== newProps.freeAccount
			|| this.props.freeAccountAndHasCredits !== newProps.freeAccountAndHasCredits
			|| this.state.exporting !== newState.exporting
		);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					exporting: head.toJS().export,
				});
			})
			.onDelete(() => {
				this.setState({
					exporting: undefined,
				});
			});

		// shortcut handling
		if (this.props.shortcut) {
			let [modifier, key] = this.props.shortcut.split('+');

			if (!key) {
				key = modifier;
				modifier = undefined;
			}

			setupKeyboardShortcut(key, modifier, () => {
				this.props.handler();
			});
		}
	}

	componentWillUpdate(newProps, newState) {
		/*if (this.state.exporting === true && newState.exporting === false) {
			console.log('export ended');
		}*/
		// console.log(newState.exporting, this.state.exporting);
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	handleClick() {
		// freeAccount and freeAccountAndHasCredits props
		// should only be set if the item is blockable
		// for free users without credits (under the overlay)
		if (this.props.freeAccountAndHasCredits) {
			// here first execute handler
			// and on callback dispatch a "spend credit" action
			// to ensure no one will pay if something went wrong
			// during the export
			this.props.handler();
			// this.client.dispatchAction('/spend-credits');
		}
		else if (this.props.freeAccount) {
			return;
		}
		else {
			this.props.handler();
		}
	}

	render() {
		const creditsAltLabel = this.props.freeAccountAndHasCredits
			? (
				<span className="credits-alt-label">{this.props.creditsAltLabel}</span>
			)
			: false;

		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] topbarmenudropdownitem');
		}
		const classes = classNames({
			'top-bar-menu-item-dropdown-item': true,
			'is-disabled': this.props.disabled,
			'has-separator': this.props.separator,
			'is-checkbox': this.props.checkbox,
			'is-active': this.props.active,
		});

		return (
			<li className={classes} onClick={this.handleClick}>
				<span className="top-bar-menu-item-dropdown-item-title">{this.props.name}</span>
				<span className="top-bar-menu-item-dropdown-item-shortcut">{this.props.shortcut}</span>
				{creditsAltLabel}
			</li>
		);
	}
}

class TopBarMenuDropdownCheckBox extends React.Component {
	componentWillMount() {

	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] topbarmenudropdowncheckbox');
		}
		const classes = classNames({
			'top-bar-menu-item-dropdown-item': true,
			'is-checkbox': true,
			'is-disabled': this.props.disabled,
		});

		return (
			<li className={classes} onClick={this.props.handler}>
				<CheckBoxWithImg checked={this.props.checked}/>
				<span className="top-bar-menu-item-dropdown-item-title">{this.props.name}</span>
				<span className="top-bar-menu-item-dropdown-item-shortcut">{this.props.shortcut}</span>
			</li>
		);
	}
}

class TopBarMenuIcon extends React.Component {

	static getHeader(props) {
		return <div className="top-bar-menu-item-icon"><img className="top-bar-menu-item-icon-img" src={props.img} /></div>;
	}

	render() {
		return false;
	}
}

export {
	TopBarMenu,
	TopBarMenuDropdown,
	TopBarMenuDropdownItem,
	TopBarMenuDropdownCheckBox,
	TopBarMenuAction,
	TopBarMenuIcon,
	TopBarMenuLink,
};
