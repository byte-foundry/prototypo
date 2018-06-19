import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

function setupKeyboardShortcut(key, modifier, cb) {
	document.addEventListener('keydown', (e) => {
		if (
			(!modifier || e[`${modifier}Key`])
			&& e.keyCode === key.toUpperCase().charCodeAt(0)
		) {
			cb();
		}
	});
}

class TopBarMenuDropdownItem extends React.PureComponent {
	constructor(props) {
		super(props);

		this.handleClick = this.handleClick.bind(this);
	}

	componentWillMount() {
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

	handleClick() {
		this.props.handler();
	}

	render() {
		const {
			id,
			name,
			shortcut,
			disabled,
			separator,
			checkbox,
			active,
			children,
		} = this.props;

		const classes = classNames({
			'top-bar-menu-item-dropdown-item': true,
			'is-disabled': disabled,
			'has-separator': separator,
			'is-checkbox': checkbox,
			'is-active': active,
		});

		return (
			<li className={classes} onClick={this.handleClick} id={id}>
				<span className="top-bar-menu-item-dropdown-item-title">{name}</span>
				{shortcut && (
					<span className="top-bar-menu-item-dropdown-item-shortcut">
						{shortcut}
					</span>
				)}
				{children}
			</li>
		);
	}
}

TopBarMenuDropdownItem.defaultProps = {
	shortcut: '',
	disabled: false,
	separator: false,
	checkbox: false,
	active: false,
	handler: () => {},
};

TopBarMenuDropdownItem.propTypes = {
	id: PropTypes.string,
	name: PropTypes.string.isRequired,
	shortcut: PropTypes.string,
	disabled: PropTypes.bool,
	separator: PropTypes.bool,
	checkbox: PropTypes.bool,
	active: PropTypes.bool,
	handler: PropTypes.func,
};

export default TopBarMenuDropdownItem;
