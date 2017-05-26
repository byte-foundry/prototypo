import React from 'react';
import PropTypes from 'prop-types';

// TMP before we get Webpack 2
import '../../../images/icons/delete.svg';
import '../../../images/icons/delete-circle.svg';

class Icon extends React.PureComponent {
	render() {
		const {name, style, ...rest} = this.props;
		const {url} = require(`../../../images/icons/${name}.svg`);

		return (
			<svg
				style={{
					stroke: 'currentColor',
					display: 'block',
					height: '24px',
					width: '24px',
					...style,
				}}
				{...rest}
			>
				<use xlinkHref={url} />
			</svg>
		);
	}
}

Icon.propTypes = {
	name: PropTypes.string.isRequired,
};

export default Icon;
