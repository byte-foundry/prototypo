import React from 'react';
import PropTypes from 'prop-types';
import getCurrency from '../../helpers/currency.helpers.js';

const Price = ({amount, ...props}) => {
	const currency = props.currency || getCurrency(props.country);

	return (
		<span>
			{amount.toLocaleString(undefined, {
				style: 'currency',
				currency,
				minimumFractionDigits: 0,
			})}
		</span>
	);
};

Price.propsType = {
	amount: PropTypes.number.isRequired,
	country: PropTypes.string,
	currency: PropTypes.string,
};

export default Price;
