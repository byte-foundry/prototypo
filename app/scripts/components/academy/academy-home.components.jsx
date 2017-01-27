import React from 'react';
import {Link} from 'react-router';
import ReactMarkdown from 'react-markdown';
import TutorialContent from 'tutorial-content';


export default class AcademyHome extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
		this.tutorials = new TutorialContent();
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

				{
					this.tutorials.content.map((tutorial) => {
						return (
							<div key={tutorial.title} className="academy-course-list">
								<h2>{tutorial.title}</h2>
								<ReactMarkdown source={tutorial.header} />
								<div className="academy-button academy-validation-button"><Link to={`/academy/course/${tutorial.title}`} > CTA </Link></div>
							</div>
						);
					})
				}
			</div>
		);
	}
}
