import PropTypes from 'prop-types';
import React from 'react';

class TopBarMenuItem extends React.PureComponent {
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
		const {children, name, ...rest} = this.props;

		return <li {...rest}>{children}</li>;
	}
}

TopBarMenuItem.defaultProps = {};

TopBarMenuItem.propTypes = {
	name: PropTypes.string.isRequired,
};

export default TopBarMenuItem;
