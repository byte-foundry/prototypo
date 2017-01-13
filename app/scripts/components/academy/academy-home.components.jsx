import React from 'react';
import {Link} from 'react-router';

export default class AcademyHome extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		return (
			<div className="academy-base academy-home">
				<h1>Hi there !</h1>

				<p>
					Welcome to the academy. <br/>
					Texte d'intro qui montre à quel point l'academy est cool, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
				</p>

				<p>
					<center>
						Just getting started with prototypo ?
						<div className="academy-button inline academy-validation-button">Take our intro course</div>
					</center>
				</p>

				<h2>Course list</h2>

				<div className="academy-course-list">
					<h1 className="academy-course-title"> Course name </h1>
					<p className="academy-course-description">
						Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
						Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
						Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
						Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
					</p>
					<label>By completing this course you will earn</label>
					<ul className="academy-course-reward">
						<li>Un massage à l huile par yannick mathey</li>
					</ul>
					<div className="academy-button academy-validation-button"><Link to="/academy/course" > CTA </Link></div>
				</div>

				<div className="academy-course-list">
					<h1 className="academy-course-title"> Course name </h1>
					<p className="academy-course-description">
						Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
						Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
						Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
						Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
					</p>
					<label>By completing this course you will earn</label>
					<ul className="academy-course-reward">
						<li>Un massage à l huile par yannick mathey</li>
					</ul>
					<div className="academy-button academy-validation-button"><Link to="/academy/course" > CTA </Link></div>
				</div>

				<div className="academy-course-list">
					<h1 className="academy-course-title"> Course name </h1>
					<p className="academy-course-description">
						Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
						Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
						Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
						Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
					</p>
					<label>By completing this course you will earn</label>
					<ul className="academy-course-reward">
						<li>Un massage à l huile par yannick mathey</li>
					</ul>
					<div className="academy-button academy-validation-button"><Link to="/academy/course" > CTA </Link></div>
				</div>

				<div className="academy-course-list">
					<h1 className="academy-course-title"> Course name </h1>
					<p className="academy-course-description">
						Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
						Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
						Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
						Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
					</p>
					<label>By completing this course you will earn</label>
					<ul className="academy-course-reward">
						<li>Un massage à l huile par yannick mathey</li>
					</ul>
					<div className="academy-button academy-validation-button"><Link to="/academy/course" > CTA </Link></div>
				</div>
			</div>
		);
	}
}
