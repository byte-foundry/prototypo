import React from 'react';
import {Link} from 'react-router';
import TutorialContent from 'tutorial-content';

export default class AcademyDashboard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.tutorials = new TutorialContent();
	}

	render() {
		const titles = {
			home: "Academy",
			course: "academy",
		};

		this.tutorials.content.map((tutorial) => {
			titles[tutorial.slug] = tutorial.title;
		});

		const backlinks = {
			home: "/dashboard",
			course: "/academy",
		};
		const curRoute = this.props.location.pathname.split('/')[this.props.location.pathname.split('/') . length - 1];
		const title = titles[curRoute];
		const backlink = backlinks[this.props.route.name];

		return (
			<div className="academy-dashboard">
				<Link to={backlinks.home}>
					<div className="academy-dashboard-icon"/>
				</Link>
				<Link to={backlink} className="academy-dashboard-back-icon"/>
				<div className="academy-header">
					<h1 className="academy-title">{title}</h1>
				</div>
				<div className="academy-dashboard-container">
					{this.props.children}
				</div>
			</div>
		);
	}
}

AcademyDashboard.contextTypes = {
	router: React.PropTypes.object.isRequired,
};
