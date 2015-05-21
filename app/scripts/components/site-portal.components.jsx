import React from 'react';
import HoodieApi from '../services/hoodie.services.jsx';

export default class SitePortal extends React.Component {
	componentWillMount() {
		HoodieApi.setup()
			.then(() => {
				location.href = '#/dashboard';
			})
			.catch(() => {
				location.href = '#/login';
			})
	}

	render() {
		return (<div></div>);
	}
}
