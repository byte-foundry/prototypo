import React from 'react';
import {Link} from 'react-router';

export default class AcademyDashboard extends React.Component {
	render() {
		const titles = {
			home: "Academy",
			course: "academy",
		};
		const backlinks = {
			home: "/dashboard",
			course: "/academy",
		};
		const title = titles[this.props.route.name];
		const backlink = backlinks[this.props.route.name];

		return (
			<div className="academy-dashboard">
				<div className="academy-dashboard-icon"/>
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
