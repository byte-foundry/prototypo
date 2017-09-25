import React from 'react';
import PropTypes from 'prop-types';

export default class FilterableTable extends React.PureComponent {
	render() {
		const {captionCondition, caption, tableHeaders} = this.props;

		return (
			<table className="sortable-table">
				{
					captionCondition
					&& <caption className="sortable-table-caption">
						{caption}
					</caption>
				}
				<thead>
					<tr>
						{(() => {
							return tableHeaders.map((header) => {
								return (
									<th className={header.styleClass} colSpan={header.colSpan} onClick={header.onClick}>
										{header.label}
									</th>
								);
							});
						})()}
					</tr>
				</thead>
				<tbody>
					{this.props.children}
				</tbody>
			</table>
		)
	}
}

FilterableTable.propTypes = {
	captionCondition: PropTypes.boolean,
}
