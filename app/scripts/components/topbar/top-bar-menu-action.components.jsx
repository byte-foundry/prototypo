import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

class TopBarMenuAction extends React.PureComponent {
	render() {
		const {
			active, img, click, name,
		} = this.props;

		const classes = classNames({
			'top-bar-menu-item-action': true,
			'is-active': active,
		});

		if (img) {
			return (
				<div className={classes} title={`Toggle ${name} view`} onClick={click}>
					<img src={`assets/images/${img}`} />
				</div>
			);
		}
		return (
			<div className={classes} onClick={click}>
				{name}
			</div>
		);
	}
}

TopBarMenuAction.defaultProps = {
	active: false,
	click: () => {},
};

TopBarMenuAction.propTypes = {
	img: PropTypes.string,
	name: PropTypes.string.isRequired,
	active: PropTypes.bool,
	click: PropTypes.func,
};

export default TopBarMenuAction;
