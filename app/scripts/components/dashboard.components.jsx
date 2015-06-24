import React from 'react';
import Sidebar from './sidebar.components.jsx';
import Workboard from './workboard.components.jsx';
import HoodieApi from '../services/hoodie.services.js';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import {Typefaces} from '../services/typefaces.services.js';
import {FontValues, AppValues} from '../services/values.services.js';
import pleaseWait from 'please-wait';

export default class Dashboard extends React.Component {

	async componentWillMount() {
		try {
			this.lifespan = new Lifespan();
			this.client = LocalClient.instance();
			const isLoggedIn = await HoodieApi.setup();

			const fontControls = await this.client.fetch('/fontControls');
			const typedataJSON = await Typefaces.getFont();
			const typedata = JSON.parse(typedataJSON);
			const initValues = {};
			_.each(typedata.parameters,(group) => {
				return _.each(group.parameters, (param) => {
					initValues[param.name] = param.init;
				});
			});
			const presetValues = typedata.presets['Modern'];

			try {
				const fontValues = await FontValues.get({typeface:'default'});
				this.client.dispatchAction('/load-values', _.extend(initValues,_.extend(presetValues,fontValues.values)));

				const appValues = await AppValues.get({typeface:'default'});
				this.client.dispatchAction('/load-app-values',appValues);
			}
			catch (err) {
				this.client.dispatchAction('/load-values',_.extend(fontControls.get('values'), _.extend(initValues,presetValues)));
				console.log(err);
			}
			pleaseWait.instance.finish();
		}
		catch (err) {
			location.href = '#/signin';
		}
	}

	componentWillUnmount() {
		this.lifespan.release();
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
