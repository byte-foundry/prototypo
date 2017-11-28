import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router';

class TopBarMenuLink extends React.PureComponent {
	render() {
		const {active, img, title} = this.props;

		const classes = classNames({
			'top-bar-menu-item-action': true,
			'is-active': active,
			'is-image-action': !!img,
		});
		const linkClassName = classNames({
			'top-bar-menu-link': true,
		});

		if (img) {
			return (
				<div className={classes}>
					<Link to="/account" className={linkClassName}>
						<img src={`assets/images/${img}`} />
					</Link>
				</div>
			);
		}
		return (
			<div className={classes}>
				<Link to="/account" className={linkClassName} title={title}>
					{name}
				</Link>
			</div>
		);
	}
}

TopBarMenuLink.defaultProps = {
	active: false,
};

TopBarMenuLink.propTypes = {
	img: PropTypes.string.isRequired,
	active: PropTypes.bool,
	title: PropTypes.string,
};

export default TopBarMenuLink;
