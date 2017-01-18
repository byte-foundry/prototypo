import React from 'react';
import TutorialContent from 'tutorial-content';
import {Parser as HtmlToReactParser} from 'html-to-react';

export default class AcademyCourse extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
		this.courseName = this.props.params.courseName;
		this.tutorials = new TutorialContent();
	}


	render() {
		const htmlToReactParser = new HtmlToReactParser();
		let course = this.tutorials.content.find((tutorial) => {
			return tutorial.name === this.courseName;
		});

		course = course ? `<div>${course.content}</div>` : `<div><p>No course found</p></div>`;
		return(
			<div key={this.courseName} className="academy-base academy-course">
				{htmlToReactParser.parse(course)}
			</div>
		);
	}
}
