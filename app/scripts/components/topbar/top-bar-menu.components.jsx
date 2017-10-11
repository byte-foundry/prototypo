import React from 'react';
import classNames from 'classnames';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {Link} from 'react-router';
import Lifespan from 'lifespan';

import LocalClient from '~/stores/local-client.stores.jsx';

import {fileTutorialLabel} from '../../helpers/joyride.helpers.js';

import Button from '../shared/button.components.jsx';

class TopBarMenu extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((store) => {
				this.setState({
					topbarItemDisplayed: store.toJS().d.topbarItemDisplayed,
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


	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] TopBarMenu');
		}
		const headers = _.without(this.props.children, false, undefined).map((child, index) => {
			const classes = classNames({
				'top-bar-menu-item': true,
				'is-aligned-right': child && child.props.alignRight,
				'is-action': child && child.props.action,
				'is-icon-menu': child && !!child.props.img,
				'is-centered': child &&child.props.centered,
				'img-dark-background': child && child.props.imgDarkBackground,
				'academy-progress-container': child && child.props.id === "progress-academy",
			});
			const count = (index > 0 && index < 5) ? index : 0;

			return (
				<TopBarMenuItem
					className={classes}
					key={index}
					id={child && child.props.id}
					count={count}
					noHover={child && child.props.noHover}
					onMouseEnter={child && child.props.enter}
					topbarItemDisplayed={this.state.topbarItemDisplayed}
					onMouseLeave={child && child.props.leave}>
					{child && child.type.getHeader(child.props)}
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

class TopBarMenuItem extends React.PureComponent {
	constructor(props) {
		super(props);

		// function binding
		this.handleClick = this.handleClick.bind(this);
		this.toggleDisplay = this.toggleDisplay.bind(this);
		this.startFileTutorial = this.startFileTutorial.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}


	toggleDisplay() {
		if (this.props.count) {
			if (this.props.topbarItemDisplayed === this.props.count) {
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
					_.each(document.querySelectorAll(selector), (item) => {
						item.removeEventListener('click', outsideClick);
					});
				};

				_.each(document.querySelectorAll(selector), (item) => {
					item.addEventListener('click', outsideClick);
				});
			}
		}
	}

	startFileTutorial() {
		this.client.dispatchAction('/store-value', {uiJoyrideTutorialValue: fileTutorialLabel});
	}

	handleClick() {
		this.toggleDisplay();

		// send tutorial action if the click was performed on the first item (file)
		if (this.props.count === 1) {
			this.startFileTutorial();
		}
	}

	render() {
		const classes = classNames(this.props.className, {
			'topbaritem-displayed': this.props.topbarItemDisplayed === this.props.count,
			'no-hover': this.props.noHover,
		});
		const id = this.props.count ? `topbar-menu-item-${this.props.count}` : '';

		return (
			<li
				className={classes}
				id={id}
				onClick={() => { this.handleClick(); }}>
				{this.props.children}
			</li>
		);
	}
}

/**
*	TopBarMenuDropdown is nestable
*	meaning that you can put a TopBarMenuDropdown inside a TopBarMenuDropdownItem
*/
class TopBarMenuDropdown extends React.PureComponent {
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

class TopBarMenuAction extends React.PureComponent {

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

class TopBarMenuLink extends React.PureComponent {

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

class TopBarMenuDropdownItem extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			credits: undefined,
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

		//function bindings
		this.handleClick = this.handleClick.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

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

	componentWillUnmount() {
		this.lifespan.release();
	}

	handleClick(e) {
		// freeAccount and freeAccountAndHasCredits props
		// should only be set if the item is blockable
		// for free users without credits (under the overlay)
		if (this.props.freeAccountAndHasCredits) {
			if (navigator.onLine) {
				// set the export cost
				this.client.dispatchAction('/store-value', {currentCreditCost: this.props.cost});
				// here first execute handler
				// and on callback dispatch a "spend credit" action
				// to ensure no one will pay if something went wrong
				// during the export
				this.props.handler(e);
				// here the "spend credit" will hapen
				// but on parent component state change
				// when "exporting" goes from true to false w/o errors
			}
			else {
				this.client.dispatchAction('/store-value', {
					errorExport: {
						message: 'Could not export while offline',
					},
				});
			}
		}
		else if (this.props.freeAccount) {
			return;
		}
		else {
			this.props.handler(e);
		}
	}


	render() {
		const creditsAltLabel = this.props.freeAccountAndHasCredits
			? (
				<span className="credits-alt-label">{`(use ${this.props.cost} credit)`}</span>
			)
			: false;

		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] topbarmenudropdownitem');
		}
		const classes = classNames({
			'top-bar-menu-item-dropdown-item': true,
			'is-disabled': this.props.disabled || (
				creditsAltLabel ? this.props.cost > this.props.credits : false
			),
			'has-separator': this.props.separator,
			'is-checkbox': this.props.checkbox,
			'is-active': this.props.active,
		});

		return (
			<li className={classes} onClick={this.handleClick} id={this.props.id}>
				<span className="top-bar-menu-item-dropdown-item-title">{this.props.name}</span>
				<span className="top-bar-menu-item-dropdown-item-shortcut">{this.props.shortcut}</span>
				{creditsAltLabel}
				{this.props.children}
			</li>
		);
	}
}

class TopBarMenuAcademy extends React.PureComponent {
	static getHeader(props) {
		return (
			<div className="top-bar-menu-item-academy">
				<Link to={`/academy/course/${props.course.slug}`}>
					<img className="top-bar-menu-item-academy-img"
						src={props.icon}
						onMouseLeave={() => {props.clearText();}}
						onMouseEnter={() => {props.setText(props.course.name, true);}}
					/>
				</Link>
				{props.course.parts.map((part) => {
					return (
						<Link to={`/academy/course/${props.course.slug}/${part.name}`}>
							<span
								onMouseEnter={() => {props.setText(`${props.course.name} - ${part.name}`);}}
								onMouseLeave={() => {props.clearText();}}
								className={`top-bar-menu-item-academy-part ${part.completed ? 'completed' : ''}`}
							/>
						</Link>
					);
				})}
				<span className="top-bar-menu-item-academy-text">
					{props.text}
				</span>
			</div>
		);
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] topbarmenuacademy');
		}
		return false;
	}
}

class TopBarMenuAcademyIcon extends React.PureComponent {
	static getHeader(props) {
		return (
			<div className="top-bar-menu-item-academy">
				<Link to={`/academy/home`}>
					<img className="top-bar-menu-item-academy-img  is-alone"
						src={props.icon}
						onMouseLeave={() => {props.clearText();}}
						onMouseEnter={() => {props.setText(false, true);}}
					/>
				</Link>
			</div>
		);
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] topbarmenuacademyicon');
		}
		return false;
	}
}

class TopBarMenuIcon extends React.PureComponent {

	static getHeader(props) {
		return <div className="top-bar-menu-item-icon"><img className="top-bar-menu-item-icon-img" src={props.img} /></div>;
	}

	render() {
		return false;
	}
}

class TopBarMenuButton extends React.PureComponent {
	static getHeader({label, click}) {
		return <Button small label={label} click={click} />;
	}

	render() {
		return false;
	}
}

export {
	TopBarMenu,
	TopBarMenuDropdown,
	TopBarMenuDropdownItem,
	TopBarMenuAction,
	TopBarMenuIcon,
	TopBarMenuLink,
	TopBarMenuButton,
	TopBarMenuAcademy,
	TopBarMenuAcademyIcon,
};
