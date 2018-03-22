import PropTypes from 'prop-types';
import React from 'react';
import {withRouter} from 'react-router';

import LocalClient from '../stores/local-client.stores';
import HoodieApi from '../services/hoodie.services';

class Logout extends React.Component {
	constructor(props) {
		super(props);

		this.logout = this.logout.bind(this);
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
	}

	async logout() {
		try {
			await HoodieApi.logout();
		}
		catch (err) {
			window.trackJs.track(err);
		}

		this.props.router.push({
			pathname: '/signin',
		});
		window.Intercom('shutdown');

		this.client.dispatchAction('/clean-data');
	}

	render() {
		return this.props.render({
			logout: this.logout,
		});
	}
}

PropTypes.defaultProps = {
	render: children => children,
};

PropTypes.propTypes = {
	render: PropTypes.func,
};

export default withRouter(Logout);
