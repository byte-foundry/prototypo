import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

class PricingItem extends React.Component {
	render() {
		const {
			title,
			description,
			priceInfo,
			selected,
			currency,
			amount,
			className,
			current,
			children,
			...rest
		} = this.props;

		const roundedAmount = Math.round(amount * 10) / 10;
		const cost = roundedAmount.toString().split('.');

		let subtitlePriceInfo = priceInfo;

		if (typeof priceInfo === 'string') {
			subtitlePriceInfo = (
				<div className="pricing-item-subtitle-price-info">{priceInfo}</div>
			);
		}

		return (
			<div
				className={classnames(
					'pricing-item',
					{
						'pricing-item--selected': selected,
					},
					className,
				)}
				role="option"
				aria-selected={selected}
				tabIndex="0"
				{...rest}
			>
				<div className="pricing-item-title">
					{title}
					{description && (
						<div className="pricing-item-title-more">{description}</div>
					)}
				</div>
				<div className="pricing-item-subtitle">
					<div className="pricing-item-subtitle-price">
						<div className="pricing-item-subtitle-price-value">
							<span>
								{currency !== 'EUR' && (
									<span className="pricing-item-subtitle-price-value-currency">
										$
									</span>
								)}
								{cost[0]}
								{cost[1] && (
									<span className="pricing-item-subtitle-price-value-small">
										.{cost[1]}
									</span>
								)}
								{currency === 'EUR' && (
									<span className="pricing-item-subtitle-price-value-currency">
										{' '}
										€
									</span>
								)}
								<span className="pricing-item-subtitle-price-value-freq">
									per month
								</span>
							</span>
						</div>
						{subtitlePriceInfo}
					</div>
				</div>
				{current && <p className="pricing-item-selected-label">Current</p>}

				{children}
			</div>
		);
	}
}

PricingItem.propTypes = {
	title: PropTypes.string,
	description: PropTypes.string,
	priceInfo: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
	selected: PropTypes.bool,
	currency: PropTypes.string.isRequired,
	amount: PropTypes.number.isRequired,
	className: PropTypes.string,
	current: PropTypes.bool,
};

PricingItem.defaultProps = {
	title: '',
	description: '',
	priceInfo: null,
	selected: false,
	className: '',
	current: false,
};

export default PricingItem;
