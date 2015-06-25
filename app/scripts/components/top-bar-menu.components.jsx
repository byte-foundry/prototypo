import React from 'react';
import Classnames from 'classnames';

class TopBarMenu extends React.Component {
	render() {
		const headers = _.map(this.props.children,(child) => {
			const classes = Classnames({
				'top-bar-menu-item':true,
				'is-aligned-right':child.props.alignRight,
			});

			return (
				<li className={classes} key={child.props.name}>
					{child.props.name}
					{child}
				</li>
			)
		});
		return (
			<ul className="top-bar-menu">
				{headers}
			</ul>
		)
	}
}

class TopBarMenuDropdown extends React.Component {
	render() {
		return (
			<ul className="top-bar-menu-item-dropdown">
				{this.props.children}
			</ul>
		)
	}
}

function setupKeyboardShortcut(key,modifier,cb) {
	document.addEventListener('keydown', (e) => {
		if ((!modifier || e[`${modifier}Key`]) && e.keyCode === key.toUpperCase().charCodeAt(0)) {
			cb();
		}
	});
};

class TopBarMenuDropdownItem extends React.Component {
	componentWillMount() {
		if (this.props.shortcut) {
			let [modifier, key] = this.props.shortcut.split('+');

			if (!key) {
				key = modifier;
				modifier = undefined;
			}

			setupKeyboardShortcut(key,modifier,() => {
				this.props.handler();
			});
		}
	}
	render() {
		const classes = Classnames({
			'top-bar-menu-item-dropdown-item':true,
			'is-disabled':this.props.disabled,
		})
		return (
			<li className={classes} onClick={this.props.handler}>
				<span className="top-bar-menu-item-dropdown-item-title">{this.props.name}</span>
				<span className="top-bar-menu-item-dropdown-item-shortcut">{this.props.shortcut}</span>
			</li>
		)
	}
}

class TopBarMenuDropdownCheckBox extends React.Component {
	componentWillMount() {

	}

	render() {
		const classes = Classnames({
			'top-bar-menu-item-dropdown-item':true,
			'is-disabled':this.props.disabled,
		});

		const checkboxClasses = Classnames({
			'top-bar-menu-item-dropdown-item-checkbox':true,
			'is-checked':this.props.checked,
		});

		return (
			<li className={classes} onClick={this.props.handler}>
				<span className={checkboxClasses}></span>
				<span className="top-bar-menu-item-dropdown-item-title">{this.props.name}</span>
				<span className="top-bar-menu-item-dropdown-item-shortcut">{this.props.shortcut}</span>
			</li>
		)
	}
}

export {
	TopBarMenu,
	TopBarMenuDropdown,
	TopBarMenuDropdownItem,
	TopBarMenuDropdownCheckBox,
}
