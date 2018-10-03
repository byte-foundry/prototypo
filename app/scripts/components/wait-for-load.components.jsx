import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

export default class WaitForLoad extends React.Component {
	render() {
		const {loading, loaded, size, secColor, children} = this.props;

		if (loading === true || loaded === false) {
			const rectClass = classNames({
				'sk-spinner': true,
				'sk-spinner-wave': true,
				'sk-secondary-color': secColor,
			});

			const classes = classNames('wait-for-load', {
				'wait-for-load--tiny': size === 'tiny',
				'wait-for-load--small': size === 'small',
				'wait-for-load--medium': size === 'medium',
				'wait-for-load--big': size === 'big',
				'wait-for-load--large': size === 'large',
			});

			return (
				<div className={classes}>
					<div className={rectClass}>
						<div className="sk-rect1" />
						<div className="sk-rect2" />
						<div className="sk-rect3" />
						<div className="sk-rect4" />
						<div className="sk-rect5" />
					</div>
				</div>
			);
		}

		return <React.Fragment>{children || null}</React.Fragment>;
	}
}

WaitForLoad.defaultProps = {
	loading: false,
	loaded: true,
	size: null,
	secColor: false,
};

WaitForLoad.propTypes = {
	loading: PropTypes.bool,
	loaded: PropTypes.bool,
	secColor: PropTypes.bool,
	size: PropTypes.oneOf(['tiny', 'small', 'medium', 'big', 'large']),
};
