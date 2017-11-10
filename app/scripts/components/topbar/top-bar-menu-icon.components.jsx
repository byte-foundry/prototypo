import PropTypes from 'prop-types';
import React from 'react';

class TopBarMenuIcon extends React.PureComponent {
	render() {
		const {img} = this.props;

		return (
			<div className="top-bar-menu-item-icon">
				<img className="top-bar-menu-item-icon-img" src={img} />
			</div>
		);
	}
}

TopBarMenuIcon.defaultProps = {};

TopBarMenuIcon.propTypes = {
	img: PropTypes.string.isRequired,
};

export default TopBarMenuIcon;
