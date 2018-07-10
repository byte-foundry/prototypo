import PropTypes from 'prop-types';
import React from 'react';

class TopBarMenuItem extends React.PureComponent {
	render() {
		const {children, name, img, ...rest} = this.props;

		return (
			<React.Fragment>
				{name}
				{img && <img className="top-bar-menu-item-img" src={img} />}
				<li {...rest}>{children}</li>
			</React.Fragment>
		);
	}
}

TopBarMenuItem.defaultProps = {};

TopBarMenuItem.propTypes = {
	name: PropTypes.string.isRequired,
};

export default TopBarMenuItem;
