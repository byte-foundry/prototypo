import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import onClickOutside from 'react-onclickoutside';

class ContextualMenu extends React.PureComponent {
	handleClickOutside = () => {
		this.props.onClickOutside();
	};

	render() {
		const classes = classNames({
			'contextual-menu': true,
			'contextual-menu--left': this.props.alignLeft || this.props.left,
			'contextual-menu--upper': this.props.upper,
		});

		return (
			<div className={classes}>
				<ul className="contextual-menu-list">{this.props.children}</ul>
			</div>
		);
	}
}

ContextualMenu.defaultProps = {
	upper: false,
	left: false,
};

ContextualMenu.propTypes = {
	upper: PropTypes.bool,
	left: PropTypes.bool,
};

ContextualMenu = onClickOutside(ContextualMenu);

class ContextualMenuItem extends React.PureComponent {
	constructor(props) {
		super(props);

		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(e) {
		e.preventDefault();

		this.props.onClick();
	}

	render() {
		const {
			className,
			active,
			splitted,
			onClick,
			altClick,
			children,
			altLabel,
		} = this.props;

		const classes = classNames(
			{
				'contextual-menu-list-item': true,
				'is-active': active,
				'is-split': splitted,
				clearfix: splitted,
			},
			className,
		);

		if (splitted) {
			return (
				<li className={classes}>
					<div className="btn danger" onClick={this.handleClick}>
						<span>{children}</span>
					</div>
					<div className="btn" onClick={altClick}>
						<span>{altLabel}</span>
					</div>
				</li>
			);
		}
		return (
			<li className={classes} onClick={this.handleClick}>
				{children}
			</li>
		);
	}
}

ContextualMenuItem.defaultProps = {
	active: false,
	splitted: false,
	onClick: () => {},
	onConfirm: () => {},
	onCancel: () => {},
};

ContextualMenuItem.propTypes = {
	active: PropTypes.bool,
	splitted: PropTypes.bool,
	onClick: PropTypes.func,
	altClick: PropTypes.func,
};

class ContextualMenuDropDown extends React.Component {
	render() {
		return (
			<li
				className="contextual-menu-list-item with-dropdown"
				onClick={this.props.click}
			>
				{this.props.text}
				<ul className="contextual-menu-list-item-dropdown">
					{this.props.options}
				</ul>
			</li>
		);
	}
}

export {ContextualMenu, ContextualMenuItem, ContextualMenuDropDown};
