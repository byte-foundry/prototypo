import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

class Icon extends React.PureComponent {
	render() {
		const {name, className, ...rest} = this.props;
		const url = require(`../../../images/icons/${name}.svg`).default;

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
