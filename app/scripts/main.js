import React from 'react';
import Router from 'react-router';
import Dashboard from './components/dashboard.components.jsx'

const Route = Router.Route,
  RouteHandler = Router.RouteHandler,
  DefaultRoute = Router.DefaultRoute;

const content = document.getElementById('content');

class App extends React.Component {
  render() {
    return (
        <RouteHandler/>
    );
  }
}

let Routes = (
  <Route handler={App} name="app" path="/">
    <DefaultRoute handler={Dashboard}/>
  </Route>
);

Router.run(Routes, function (Handler) {
  React.render(<Handler/>, content);
});
