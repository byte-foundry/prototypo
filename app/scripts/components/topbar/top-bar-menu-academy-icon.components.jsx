import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router';

class TopBarMenuAcademyIcon extends React.PureComponent {
	static getHeader() {
		return null;
	}

	render() {
		const {icon, clearText, setText} = this.props;

		return (
			<div className="top-bar-menu-item-academy">
				<Link to="/academy/home">
					<img
						className="top-bar-menu-item-academy-img is-alone"
						src={icon}
						onMouseLeave={() => clearText()}
						onMouseEnter={() => setText(false, true)}
					/>
				</Link>
			</div>
		);
	}
}

TopBarMenuAcademyIcon.defaultProps = {
	icon: '',
	clearText: () => {},
	setText: () => {},
};

TopBarMenuAcademyIcon.propTypes = {
	icon: PropTypes.string,
	clearText: PropTypes.func,
	setText: PropTypes.func,
};

export default TopBarMenuAcademyIcon;
