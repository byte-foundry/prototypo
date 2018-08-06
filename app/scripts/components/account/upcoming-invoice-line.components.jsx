import React from 'react';

import Price from '../shared/price.components';

import * as Plans from '../../data/plans.data';

class InvoiceLine extends React.Component {
	render() {
		const {line, currency} = this.props;
		let {description: desc} = line;

		if (line.plan && !desc) {
			const plan = Object.values(Plans).filter(({prefix}) =>
				line.plan.id.includes(prefix),
			)[0];
			const planName = (plan && plan.description) || 'Unknown plan';

			const formatter = new Intl.DateTimeFormat('en-US');
			const startDate = formatter.format(
				new Date(line.period.start * 1000),
			);
			const endDate = formatter.format(new Date(line.period.end * 1000));

			const quantityDesc = line.quantity > 1 ? `${line.quantity} x ` : '';

			desc = `${quantityDesc}${planName} from ${startDate} to ${endDate}`;
		}

		return (
			<tr className="invoice-line">
				<td>{desc}</td>
				<td>
					<Price amount={line.amount / 100} currency={currency} />
				</td>
			</tr>
		);
	}
}

export default InvoiceLine;
