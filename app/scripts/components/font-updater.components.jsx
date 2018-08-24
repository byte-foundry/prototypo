import React from 'react';
import _uniq from 'lodash/uniq';
import deepEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';

import FontMediator from '../prototypo.js/mediator/FontMediator';

class FontUpdater extends React.Component {
	constructor(props) {
		super(props);

		this.fontMediatorInstance = FontMediator.instance();
	}

	shouldComponentUpdate(nextProps) {
		const subset = _uniq(this.props.subset.split('')).join('');
		const nextSubset = _uniq(nextProps.subset.split('')).join('');

		return !(
			nextProps.family === this.props.family
			&& nextProps.variant === this.props.variant
			&& nextProps.name === this.props.name
			&& nextProps.template === this.props.template
			&& nextSubset === subset
			&& nextProps.glyph === this.props.glyph
			&& deepEqual(nextProps.values, this.props.values)
		);
	}

	render() {
		const {template, name, subset, glyph, values, family, variant} = this.props;

		const subsetCodes = _uniq(subset.split('')).map(letter =>
			letter.charCodeAt(0),
		);

		this.fontMediatorInstance.setupInfo({
			family,
			style: variant,
			template,
		});

		this.fontMediatorInstance.getFont(
			name,
			template,
			values,
			subsetCodes,
			glyph,
		);

		return false;
	}
}

FontUpdater.defaultProps = {
	name: 'CustomFont',
	family: 'Prototypo Font',
	variant: 'Regular',
	values: {},
	subset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
};

FontUpdater.propTypes = {
	name: PropTypes.string,
	template: PropTypes.string.isRequired,
	values: PropTypes.object,
	family: PropTypes.string,
	variant: PropTypes.string,
	subset: PropTypes.string,
	glyph: PropTypes.string,
};

export default FontUpdater;
