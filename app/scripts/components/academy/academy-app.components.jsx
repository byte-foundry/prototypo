import React from 'react';
import {Route, Redirect, Switch} from 'react-router-dom';
import TutorialContent from 'tutorial-content';

import Dashboard from './academy-dashboard.components';
import Home from './academy-home.components';
import Course from './academy-course.components';

export default class AcademyApp extends React.PureComponent {
	constructor(props) {
		super(props);

		this.tutorials = new TutorialContent();
	}

	render() {
		return (
			<div className="academy-app">
				<Switch>
					<Route
						path="/academy"
						exact
						render={() => (
							<Dashboard isHomepage>
								<Home tutorials={this.tutorials} />
							</Dashboard>
						)}
					/>
					<Route
						path="/academy/course/:courseSlug/:partName?"
						render={({match: {params}}) =>
							(this.tutorials[params.courseSlug] ? (
								<Dashboard title={this.tutorials[params.courseSlug].title}>
									<Course tutorials={this.tutorials} params={params} />
								</Dashboard>
							) : (
								<Redirect to="/academy" />
							))
						}
					/>
					<Redirect from="*" to="/academy" />
				</Switch>
			</div>
		);
	}
}
