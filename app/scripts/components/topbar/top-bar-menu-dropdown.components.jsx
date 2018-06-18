import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 *	TopBarMenuDropdown is nestable
 *	meaning that you can put a TopBarMenuDropdown inside a TopBarMenuDropdownItem
 */
class TopBarMenuDropdown extends React.PureComponent {
	static getHeader({name, img}) {
		const content = {
			title: name ? (
				<span className="top-bar-menu-item-title" key={`titleheader${name}`}>
					{name}
				</span>
			) : (
				false
			),
			img: img ? (
				<img
					className="top-bar-menu-item-img"
					src={img}
					key={`imgheader${name}`}
				>
					{name}
				</img>
			) : (
				false
			),
		};

		return [content.title, content.img];
	}

	render() {
		const {small, idMenu, children} = this.props;
		const classes = classNames({
			'top-bar-menu-item-dropdown': true,
			'is-small': small,
		});

		return (
			<ul className={classes} id={idMenu}>
				{children}
			</ul>
		);
	}
}

TopBarMenuDropdown.defaultProps = {
	small: false,
};

TopBarMenuDropdown.propTypes = {
	name: PropTypes.string.isRequired,
	img: PropTypes.string,
	small: PropTypes.bool,
	idMenu: PropTypes.string,
};

export default TopBarMenuDropdown;
