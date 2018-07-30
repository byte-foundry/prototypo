import PropTypes from 'prop-types';
import React from 'react';

const FakeCard = ({card}) => (
	<div className="subscription-card-and-validation-card">
		<div className="subscription-card-and-validation-card-chip">
			<div className="subscription-card-and-validation-card-chip-left" />
			<div className="subscription-card-and-validation-card-chip-right" />
		</div>
		<div className="subscription-card-and-validation-card-number">
			**** **** **** {card.last4}
		</div>
		<div className="subscription-card-and-validation-card-date">
			{card.exp_month}/{card.exp_year}
		</div>
		<div className="subscription-card-and-validation-card-name">
			{card.name}
		</div>
	</div>
);

FakeCard.defaultProps = {
	card: {
		last4: '1234',
		exp_month: 1,
		exp_year: (new Date().getFullYear() + 2).toFixed(0).slice(2),
		name: 'Mr Jean Michel Avous',
	},
};

FakeCard.propTypes = {
	card: PropTypes.shape({
		last4: PropTypes.string.isRequired,
		exp_month: PropTypes.number.isRequired,
		exp_year: PropTypes.number.isRequired,
		name: PropTypes.string.isRequired,
	}),
};

export default FakeCard;
