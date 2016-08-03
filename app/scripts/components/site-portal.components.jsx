import React from 'react';
/* #if offline */
import HoodieApi from '../services/fake-hoodie.services.js';
/* #end*/
/* #if prod,debug */
import HoodieApi from '../services/hoodie.services.js';
/* #end*/

export default class SitePortal extends React.Component {
	componentWillMount() {
		HoodieApi.setup()
			.then(() => {
				location.href = '#/dashboard';
			})
			.catch(() => {
				location.href = '#/signin';
			});
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] SitePortal');
		}
		return (<div></div>);
	}
}
