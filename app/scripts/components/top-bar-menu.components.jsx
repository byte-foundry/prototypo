import React from 'react';
import Classnames from 'classnames';
import CheckBoxWithImg from './checkbox-with-img.components.jsx';

class TopBarMenu extends React.Component {
	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] TopBarMenu');
		}
		const headers = _.without(this.props.children, false).map((child) => {
			const classes = Classnames({
				'top-bar-menu-item': true,
				'is-aligned-right': child.props.alignRight,
				'is-action': child.props.action,
				'is-icon-menu': !!child.props.img,
			});

			return (
				<li className={classes} key={child.props.name || child.props.img} id={child.props.id} onMouseEnter={child.props.enter} onMouseLeave={child.props.leave}>
					{child.type.getHeader(child.props)}
					{child}
				</li>
			);
		});

		return (
			<ul className="top-bar-menu">
				{headers}
			</ul>
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
		const classes = Classnames({
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

		const classes = Classnames({
			'top-bar-menu-item-action': true,
			'is-active': props.active,
		});

		if ( props.img ) {
			return <div className={classes} title={`Toggle ` + props.name + ` view`} onClick={(e) => {props.click(e);}}><img src={`assets/images/`+ props.img} /></div>;
		} else {
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


function setupKeyboardShortcut(key, modifier, cb) {
	document.addEventListener('keydown', (e) => {
		if ((!modifier || e[`${modifier}Key`]) && e.keyCode === key.toUpperCase().charCodeAt(0)) {
			cb();
		}
	});
}

class TopBarMenuDropdownItem extends React.Component {
	shouldComponentUpdate(newProps) {
		return (
			this.props.name !== newProps.name
			|| this.props.shortcut !== newProps.shortcut
			|| this.props.handler !== newProps.handler
		);
	}

	componentWillMount() {
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
	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] topbarmenudropdownitem');
		}
		const classes = Classnames({
			'top-bar-menu-item-dropdown-item': true,
			'is-disabled': this.props.disabled,
			'has-separator': this.props.separator,
			'is-checkbox': this.props.checkbox,
			'is-active': this.props.active,
		});

		return (
			<li className={classes} onClick={this.props.handler}>
				<span className="top-bar-menu-item-dropdown-item-title">{this.props.name}</span>
				<span className="top-bar-menu-item-dropdown-item-shortcut">{this.props.shortcut}</span>
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
		const classes = Classnames({
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
};
