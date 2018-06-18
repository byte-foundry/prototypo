import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

class ViewAlert extends React.PureComponent {
	render() {
		const {text, className, inside, ...rest} = this.props;

		const classes = classnames({
			'view-alert': true,
			'view-alert-is-inside': inside,
			...className,
		});

		return <div className={classes}>{text}</div>;
	}
}

ViewAlert.propTypes = {
	text: PropTypes.string,
};

export default ViewAlert;
