import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 *	TopBarMenuDropdown is nestable
 *	meaning that you can put a TopBarMenuDropdown inside a TopBarMenuDropdownItem
 */
class TopBarMenuDropdown extends React.PureComponent {
	render() {
		const {small, idMenu, name, img, children} = this.props;
		const classes = classNames({
			'top-bar-menu-item-dropdown': true,
			'is-small': small,
		});

		return (
			<React.Fragment>
				{name}
				{img && <img className="top-bar-menu-item-img" src={img} alt={name} />}
				<ul className={classes} id={idMenu}>
					{children}
				</ul>
			</React.Fragment>
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
