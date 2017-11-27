import PropTypes from 'prop-types';
import React from 'react';
import onClickOutside from 'react-onclickoutside';
import classNames from 'classnames';

class TopBarMenu extends React.PureComponent {
	constructor(props) {
		super(props);

		this.handleClickOutside = this.handleClickOutside.bind(this);
		this.onSelectItem = this.onSelectItem.bind(this);
	}

	onSelectItem(itemIndex) {
		this.props.onSelectedItem(itemIndex);
	}

	handleClickOutside() {
		this.props.onSelectedItem(null);
	}

	render() {
		const {itemDisplayed, children} = this.props;

		return (
			<ul className="top-bar-menu">
				{React.Children.map(children, (child, index) => {
					if (!child || !child.props) {
						return child;
					}

					const {
						alignRight,
						action,
						img,
						centered,
						imgDarkBackground,
						headerClassName,
						id,
						noHover,
						enter,
						onSelect,
					} = child.props;

					const classes = classNames(
						{
							'top-bar-menu-item': true,
							'is-aligned-right': alignRight,
							'is-action': action,
							'is-icon-menu': img,
							'is-centered': centered,
							'img-dark-background': imgDarkBackground,
						},
						headerClassName,
					);
					const count = index > 0 && index < 5 ? index : 0;

					return (
						<TopBarMenuItem
							className={classes}
							key={index} // eslint-disable-line
							id={id}
							count={count}
							noHover={noHover}
							onMouseEnter={enter}
							selected={itemDisplayed === index}
							onMouseLeave={child && child.props.leave}
							onSelectItem={this.onSelectItem}
							onSelect={onSelect}
						>
							{child && child.type.getHeader && child.type.getHeader(child.props)}
							{child}
						</TopBarMenuItem>
					);
				})}
			</ul>
		);
	}
}

TopBarMenu.defaultProps = {
	className: '',
	itemDisplayed: null,
	noHover: false,
	count: 0,
	onSelectedItem: () => {},
};

TopBarMenu.propTypes = {
	className: PropTypes.string,
	itemDisplayed: PropTypes.number,
	noHover: PropTypes.bool,
	count: PropTypes.number,
	onSelectedItem: PropTypes.func,
};

export const TopBarMenuRaw = TopBarMenu;
export default onClickOutside(TopBarMenu);

class TopBarMenuItem extends React.PureComponent {
	constructor(props) {
		super(props);

		this.handleClick = this.handleClick.bind(this);
	}

	componentWillReceiveProps({selected, onSelect}) {
		if (!this.props.selected && selected) {
			onSelect();
		}
	}

	handleClick() {
		this.props.onSelectItem(this.props.count);
	}

	render() {
		const {className, noHover, selected, count, children} = this.props;

		const classes = classNames(className, {
			'topbaritem-displayed': selected,
			'no-hover': noHover,
		});
		const id = count ? `topbar-menu-item-${this.props.count}` : '';

		return (
			<li className={classes} id={id} onClick={this.handleClick}>
				{children}
			</li>
		);
	}
}

TopBarMenuItem.defaultProps = {
	className: '',
	noHover: false,
	count: 0,
	selected: false,
	onSelect: () => {},
};

TopBarMenuItem.propTypes = {
	className: PropTypes.string,
	noHover: PropTypes.bool,
	count: PropTypes.number,
	selected: PropTypes.bool,
	onSelect: PropTypes.func,
};
