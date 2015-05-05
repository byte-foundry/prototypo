import React from 'react';
import Router from 'react-router';
import Dashboard from './components/dashboard.components.jsx';
import Remutable from 'remutable';
import LocalClient from './stores/local-client.stores.jsx';
import LocalServer from './stores/local-server.stores.jsx';
const { Patch } = Remutable;

const stores = {};
const eventBackLog = stores['/eventBackLog'] = new Remutable({
	from:0,
	to:undefined,
	eventList: [
		undefined
	]
});

const fontControls = stores['/fontControls'] = new Remutable({});
const localServer = new LocalServer(stores).instance;
const localClient = new LocalClient(localServer).instance;


const actions = {
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
	'/store-action':({store,patch}) => {
		const newEventList = eventBackLog.get('eventList');
		const eventIndex = eventBackLog.get('to') || eventBackLog.get('from');
		if (newEventList.length - 1 > eventIndex) {
			newEventList.splice(eventIndex + 1, newEventList.length);
		}
		newEventList.push(
			{
				patch:patch.toJSON(),
				store:'/fontControls',
			});
		const eventPatch = eventBackLog.set('eventList',newEventList)
			.set('to',undefined)
			.set('from',newEventList.length - 1).commit();
		localServer.dispatchUpdate('/eventBackLog',eventPatch);
	},
}

localServer.on('action',({path, params}) => {
	if(actions[path] !== void 0) {
	    actions[path](params);
	}
}, localServer.lifespan);

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
    <DefaultRoute handler={Dashboard}/>
  </Route>
);

Router.run(Routes, function (Handler) {
  React.render(<Handler />, content);
});
