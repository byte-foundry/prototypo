import PropTypes from 'prop-types';
import React from 'react';

import LocalClient from '../../stores/local-client.stores';

import TopBarMenuDropdownItem from './top-bar-menu-dropdown-item.components';

const TopBarMenuDropdownProItem = ({
	freeAccount,
	credits,
	cost,
	children,
	handler,
	disabled,
	...rest
}) => {
	const creditsAltLabel = !!(freeAccount && credits > 0) && (
		<span className="credits-alt-label">{`(use ${cost} credit)`}</span>
	);

	const protectedHandler = () => {
		const client = LocalClient.instance();

		// freeAccount and credits props
		// should only be set if the item is blockable
		// for free users without credits (under the overlay)
		if (freeAccount && credits > 0 && credits >= cost) {
			if (navigator.onLine) {
				// set the export cost
				client.dispatchAction('/store-value', {
					errorExport: null,
					currentCreditCost: cost,
				});
				// here first execute handler
				// and on callback dispatch a "spend credit" action
				// to ensure no one will pay if something went wrong
				// during the export
				handler();
				// here the "spend credit" will hapen
				// but on parent component state change
				// when "exporting" goes from true to false w/o errors
			}
			else {
				client.dispatchAction('/store-value', {
					errorExport: {
						message: 'Could not export while offline',
					},
				});
			}
		}
		else if (!freeAccount) {
			handler();
		}
	};

	return (
		<TopBarMenuDropdownItem
			handler={protectedHandler}
			disabled={disabled || (freeAccount && cost > credits)}
			{...rest}
		>
			{creditsAltLabel}
			{children}
		</TopBarMenuDropdownItem>
	);
};

TopBarMenuDropdownProItem.defaultProps = {
	freeAccount: false,
	cost: 1,
	credits: 0,
};

TopBarMenuDropdownProItem.propTypes = {
	...TopBarMenuDropdownItem.propTypes,
	freeAccount: PropTypes.bool,
	cost: PropTypes.number,
	credits: PropTypes.number,
};

export default TopBarMenuDropdownProItem;
