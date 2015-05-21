import React from 'react';
import Sidebar from './sidebar.components.jsx';
import Workboard from './workboard.components.jsx';
import HoodieApi from '../services/hoodie.services.js';

export default class Dashboard extends React.Component {

	async componentWillMount() {
		try {
			const isLoggedIn = await HoodieApi.setup();
		}
		catch (err) {
			location.href('#/signin');
		}
	}

	render() {

		/* These are some guidelines about css:
		 * - All these guidelines have to be considered in the scope of SMACSS
		 * - All the first descendant of dashboard are unique layout container
		 * (i.e they have a unique id in there first element preferrably the
		 * lowercased name of the component)
		 * - Layout component should be named with a Capitalized name
		 * (i.e Sidebar, Menubar or Workboard)
		 * - All descendant of layout components are modules
		 * - the modules should have a class that is the name of the component
		 * in kebab-case (YoYoMa -> yo-yo-ma);
		 * - layout styles are prefixed with "l-"
		 * - state styles are prefixed with "is-"
		*/

		return (
			<div id="dashboard">
				<Sidebar />
				<Workboard />
			</div>
		)
	}
}
