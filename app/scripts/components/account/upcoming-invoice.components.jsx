import React from 'react';

import Price from '../shared/price.components';
import InvoiceLine from './upcoming-invoice-line.components';

const Invoice = ({currency, lines, total}) => {
	const invoiceLines = lines.data.map(line => (
		<InvoiceLine key={line.id} line={line} currency={currency} />
	));

	return (
		<table className="invoice">
			<thead>
				<tr>
					<th className="invoice-big-head">Description</th>
					<th>Amount</th>
				</tr>
			</thead>
			<tbody>
				{invoiceLines}
				<tr className="invoice-total">
					<td className="invoice-total-label">Total</td>
					<td className="invoice-total-amount">
						<Price amount={total / 100} currency={currency} />
					</td>
				</tr>
			</tbody>
		</table>
	);
};

export default Invoice;
