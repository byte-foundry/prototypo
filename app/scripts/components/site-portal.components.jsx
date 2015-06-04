import React from 'react';
import HoodieApi from '../services/hoodie.services.js';

export default class SitePortal extends React.Component {
	componentWillMount() {
		HoodieApi.setup()
			.then(() => {
				location.href = '#/dashboard';
			})
			.catch(() => {
				location.href = '#/signin';
			})
	}

	render() {
		return (<div></div>);
	}
}
