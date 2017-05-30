import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// TMP before we get Webpack 2
import '../../../images/icons/delete.svg';
import '../../../images/icons/delete-circle.svg';
import '../../../images/icons/sub-account-active.svg';
import '../../../images/icons/sub-account-pending.svg';

class Icon extends React.PureComponent {
	render() {
		const {name, className, ...rest} = this.props;
		const {url} = require(`../../../images/icons/${name}.svg`);

		const classes = classnames('icon', className);

		return (
			<svg className={classes} {...rest}>
				<use xlinkHref={url} />
			</svg>
		);
	}
}

Icon.propTypes = {
	name: PropTypes.string.isRequired,
};

export default Icon;
