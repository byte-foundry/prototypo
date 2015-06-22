import pleaseWait from 'please-wait';

pleaseWait.instance = pleaseWait.pleaseWait({
	logo:'/assets/images/prototypo-icon.png',
	backgroundColor: '#49e4a9',
	loadingHtml:`Hey man I'm loading`,
});

import React from 'react';
import Router from 'react-router';

import Dashboard from './components/dashboard.components.jsx';
import SitePortal from './components/site-portal.components.jsx'
import NotLoggedIn from './components/not-logged-in.components.jsx';
import Subscriptions from './components/subscriptions.components.jsx';

import Remutable from 'remutable';
import LocalClient from './stores/local-client.stores.jsx';
import LocalServer from './stores/local-server.stores.jsx';
import RemoteClient from './stores/remote-client.stores.jsx';
const { Patch } = Remutable;

import {Typefaces} from './services/typefaces.services.js';
// import Prototypo from '../../node_modules/prototypo.js/dist/prototypo.js';
import PrototypoCanvas from '../../node_modules/prototypo-canvas/dist/prototypo-canvas.js';
import HoodieApi from './services/hoodie.services.js';
import uuid from 'node-uuid';

Stripe.setPublishableKey('pk_test_bK4DfNp7MqGoNYB3MNfYqOAi')

const stores = {};
const localServer = new LocalServer(stores).instance;
LocalClient.setup(localServer);
const localClient = LocalClient.instance();
const eventBackLog = stores['/eventBackLog'] = new Remutable({
	from:0,
	to:undefined,
	eventList: [
		undefined
	]
});

const fontTab = stores['/fontTab'] = new Remutable({});

const fontControls = stores['/fontControls'] = new Remutable({
	values:{},
});

const sideBarTab = stores['/sideBarTab'] = new Remutable({});

const fontStore = stores['/fontStore'] = new Remutable({});

const glyphs = stores['/glyphs'] = new Remutable({});

const panel = stores['/panel'] = new Remutable({});

const canvasEl = window.canvasElement = document.createElement('canvas');
canvasEl.className = "prototypo-canvas";
canvasEl.width = 1024;
canvasEl.height = 1024;

//RemoteClient.createClient('subscription','http://localhost:43430');

//HoodieApi.on('connected',() => {
//	RemoteClient.initRemoteStore('stripe', `/stripe${uuid.v4()}$$${HoodieApi.instance.hoodieId}`,'subscription');
//});

async function createStores() {

	const actions = {
		'/load-params': (params) => {
			const patch = fontControls
				.set('parameters',params)
				.commit();
			localServer.dispatchUpdate('/fontControls',patch);
		},
		'/load-values': (params) => {
			const patch = fontControls
				.set('values',params)
				.commit();
			localServer.dispatchUpdate('/fontControls',patch);
			localClient.dispatchAction('/store-action',{store:'/fontControls',patch});
			localClient.dispatchAction('/update-font', params);
		},
		'/load-glyphs': (params) => {
			const patch = glyphs
				.set('glyphs',params)
				.commit()
			localServer.dispatchUpdate('/glyphs',patch);
		},
		'/create-font': (params) => {
			const patch = fontStore
				.set('fontName', params.font.ot.familyName)
				.commit();
			localServer.dispatchUpdate('/fontStore',patch);
		},
		'/update-font': (params) => {
			// we need a non-empty params object
			if ( !params || !Object.keys( params ).length ) {
				return;
			}

			fontPromise
				.then(() => {
					font.subset(panel.head.toJS().text || false);
					params.ascenderHeight = params.ascender + params.xHeight;
					params.capHeight = params.xHeight + params.capDelta;
					params.contrast = -params._contrast;
					params.spacing = 1;
					font.update(params);
				});
		},
		'/go-back': () => {

			const eventIndex = eventBackLog.get('to') || eventBackLog.get('from');
			const event = eventBackLog.get('eventList')[eventIndex];
			const eventList = eventBackLog.get('eventList');

			if (eventIndex > 1) {

				const revert = Patch.revert(Patch.fromJSON(event.patch));
				localServer.dispatchUpdate('/eventBackLog',
					eventBackLog.set('from',eventIndex)
						.set('to',eventIndex - 1).commit());
				localServer.dispatchUpdate(event.store,revert);

			}
		},
		'/go-forward':() => {

			const eventIndex = eventBackLog.get('to');

			if (eventIndex) {

				const event = eventBackLog.get('eventList')[eventIndex+1];
				const eventList = eventBackLog.get('eventList');

				if (event) {

					localServer.dispatchUpdate('/eventBackLog',
						eventBackLog.set('from',eventIndex)
							.set('to',eventIndex + 1).commit());
					localServer.dispatchUpdate(event.store,Patch.fromJSON(event.patch));

				}

			}

		},
		'/store-action':({store,patch,label}) => {

			const newEventList = Array.from(eventBackLog.get('eventList'));
			const eventIndex = eventBackLog.get('to') || eventBackLog.get('from');

			if (newEventList.length - 1 > eventIndex) {

				newEventList.splice(eventIndex + 1, newEventList.length);

			}

			newEventList.push(
				{
					patch:patch.toJSON(),
					store:store,
					label:label,
				});
			const eventPatch = eventBackLog.set('eventList',newEventList)
				.set('to',undefined)
				.set('from',newEventList.length - 1).commit();
			localServer.dispatchUpdate('/eventBackLog',eventPatch);
		},
		'/select-glyph':({unicode}) => {
				const patch = glyphs.set('selected',unicode).commit();
				localServer.dispatchUpdate('/glyphs', patch);

				font.displayChar(String.fromCharCode(unicode));

				// this.undoWatcher.forceUpdate(patch,params.label);
		},
		'/change-panel-mode': ({mode}) => {
			const patch = panel.set('mode',mode).commit();
			localServer.dispatchUpdate('/panel',patch);
		},
		'/store-panel-pos': ({pos}) => {
			const patch = panel.set('pos',pos).commit();
			localServer.dispatchUpdate('/panel',patch);
		},
		'/store-panel-zoom': ({zoom}) => {
			const patch = panel.set('zoom',zoom).commit();
			localServer.dispatchUpdate('/panel',patch);
		},
		'/store-text': ({text}) => {
			const patch = panel.set('text',text).commit();
			localServer.dispatchUpdate('/panel',patch);
			font.subset(panel.head.toJS().text || false);
		},
	}

	localServer.on('action',({path, params}) => {

		if(actions[path] !== void 0) {

			actions[path](params);

		}

	}, localServer.lifespan);

	const typedataJSON = await Typefaces.getFont();
	const typedata = JSON.parse(typedataJSON);
	const prototypoSource = await Typefaces.getPrototypo();
	let workerUrl;
	let prototypoUrl;

	// The worker will be built from URL when during development, and from
	// source in production.
	if ( process.env.NODE_ENV !== 'production' ) {
		workerUrl = '/prototypo-canvas/src/worker.js';
		prototypoUrl = '/prototypo.js/dist/prototypo.js';
	}

	const fontPromise = PrototypoCanvas.load({
		canvas:canvasEl,
		fontSource: typedataJSON,
		prototypoSource: prototypoSource,
		workerUrl,
		prototypoUrl,
	});

	const font = window.fontInstance = await fontPromise;
	font.displayChar('A');
	localClient.dispatchAction('/create-font', font);

	localClient.dispatchAction('/load-params', typedata.parameters);
	localClient.dispatchAction('/load-glyphs', font.font.altMap);
}

createStores()
	.then(() => {
		const Route = Router.Route,
		  RouteHandler = Router.RouteHandler,
		  DefaultRoute = Router.DefaultRoute;

		const content = document.getElementById('content');

		class App extends React.Component {
		  render() {
		    return (
		        <RouteHandler />
		    );
		  }
		}

		let Routes = (
		  <Route handler={App} name="app" path="/">
		    <DefaultRoute handler={SitePortal}/>
		    <Route name="dashboard" handler={Dashboard}/>
		    <Route name="signin" handler={NotLoggedIn}/>
		    <Route name="subscription" handler={Subscriptions}/>
		  </Route>
		);

		Router.run(Routes, function (Handler) {
		  React.render(<Handler />, content);
		});
	});
