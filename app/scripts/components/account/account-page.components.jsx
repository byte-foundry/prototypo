import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router';

export default class AccountPage extends React.Component {
	render() {
		const {title, children, className, subtitle} = this.props;
		const classes = classnames('account-dashboard', className);

		return (
			<div className={classes}>
				<Link to="/dashboard">
					<div className="account-dashboard-icon" />
				</Link>
				<Link to="/dashboard">
					<div className="account-dashboard-back-icon" />
				</Link>
				<div className="account-header">{title && <h1 className="account-title">{title}</h1>}</div>
				{subtitle && <h1 className="account-dashboard-page-title">{subtitle}</h1>}
				{children}
			</div>
		);
	}
}

AccountPage.defaultProps = {
	className: '',
};

AccountPage.propTypes = {
	title: PropTypes.node,
	subtitle: PropTypes.node,
	className: PropTypes.string,
};
