import React from 'react';
import {Link} from 'react-router';
import ReactMarkdown from 'react-markdown';
import TutorialContent from 'tutorial-content';
import LocalClient from '../../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import InlineSVG from 'svg-inline-react';

export default class AcademyHome extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			academyProgress: {},
		};
		this.tutorials = new TutorialContent();
		this.courses = [];
		this.getPartsDone = this.getPartsDone.bind(this);
		this.isReading = this.isReading.bind(this);
	}
	componentWillMount() {
		let academyProgress = this.state.academyProgress || {};

		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
				this.client.getStore('/userStore', this.lifespan)
			.onUpdate((head) => {
				academyProgress = head.toJS().d.infos.academyProgress || {};
				this.setState({
					academyProgress: head.toJS().d.infos.academyProgress || {},
				});
			});
		// Map through the course to :
		// Get title, header and slug
		// Get part count from progress or init the progress
		this.tutorials.content.map((tutorial) => {
			let parts = [];

			if (academyProgress[tutorial.slug]) {
				parts = academyProgress[tutorial.slug].parts;
			}
			else {
				tutorial.content.split("## ").map((value, index) => {
					if (index !== 0) {
						parts.push({
							name: value.split(/\r\n|\r|\n/g)[0],
							completed: false,
						});
					}
				});
				this.client.dispatchAction(
					'/create-course-progress',
					{
						slug: tutorial.slug,
						name: tutorial.title,
						parts,
					}
				);
				academyProgress[tutorial.slug] = {
					parts,
					name: tutorial.title,
					rewarded: false,
				};
			}
			this.courses.push({
				title: tutorial.title,
				header: tutorial.header,
				slug: tutorial.slug,
				partCount: parts.length,
				readingTime: tutorial.readingTime,
				headerImage: tutorial.headerImage,
				reward: tutorial.reward,
			});
		});

		this.setState({academyProgress});
	}
	getPartsDone(slug) {
		const partsDone = this.state.academyProgress[slug].parts.filter((part) => {
			return part.completed === true;
		});

		return partsDone ? partsDone.length : 0;
	}
	isReading(slug) {
		return this.state.academyProgress.lastCourse === slug;
	}
	render() {
		let partsDone = false;

		// const tutorialReward = tutorial.reward
		// ? (<div className="academy-reward">
		// 	<span className="text-italic">By completing this course you {partsDone === tutorial.partCount ? 'earned' : 'will earn'}:</span>
		// 	<ul>
		// 		<li>{tutorial.reward}</li>
		// 	</ul>
		// </div>) : false;
		return (
			<div className="academy-base academy-home">
				<div className="academy-home-header">
					<InlineSVG className="academy-home-header-icon-postit" element="div" src={require('!svg-inline?classPrefix=postit-!../../../images/academy/postit.svg')} />
					<InlineSVG className="academy-home-header-icon-iphone" element="div" src={require('!svg-inline?classPrefix=iphone-!../../../images/academy/iphone.svg')} />
					<InlineSVG className="academy-home-header-icon-redbook" element="div" src={require('!svg-inline?classPrefix=redbook-!../../../images/academy/redbook.svg')} />
					<InlineSVG className="academy-home-header-icon-macbook" element="div" src={require('!svg-inline?classPrefix=macbook-!../../../images/academy/macbook.svg')} />
					<InlineSVG className="academy-home-header-icon-pen" element="div" src={require('!svg-inline?classPrefix=pen-!../../../images/academy/pen.svg')} />
					<InlineSVG className="academy-home-header-icon-coffee" element="div" src={require('!svg-inline?classPrefix=coffee-!../../../images/academy/coffee.svg')} />
					<InlineSVG className="academy-home-header-icon-ruler" element="div" src={require('!svg-inline?classPrefix=ruler-!../../../images/academy/ruler.svg')} />
					<InlineSVG className="academy-home-header-icon-bluebook" element="div" src={require('!svg-inline?classPrefix=bluebook-!../../../images/academy/bluebook.svg')} />
					<InlineSVG className="academy-home-header-icon-paper" element="div" src={require('!svg-inline?classPrefix=paper-!../../../images/academy/paper.svg')} />
					<InlineSVG className="academy-home-header-icon-loupe" element="div" src={require('!svg-inline?classPrefix=loupe-!../../../images/academy/loupe.svg')} />
					<InlineSVG className="academy-home-header-icon-blackpen" element="div" src={require('!svg-inline?classPrefix=blackpen-!../../../images/academy/blackpen.svg')} />
				</div>
				<div className="academy-course-list">
					{
							this.courses.map((tutorial) => {
								partsDone = this.getPartsDone(tutorial.slug);
								return (
									<div key={tutorial.title} className={`academy-course-list-elem ${this.isReading(tutorial.slug) ? 'currentlyreading' : ''} ${partsDone === tutorial.partCount ? 'done' : ''}`}>
										<Link to={`/academy/course/${tutorial.slug}`}>
											<div className="academy-course-list-elem-header">
												<img className="header-image" src={tutorial.headerImage} alt={`${tutorial.title} header image`} />
												<Link className={`academy-startcourse ${this.isReading(tutorial.slug) ? 'currentlyreading' : ''}`} to={`/academy/course/${tutorial.slug}`}> {this.isReading(tutorial.slug) ? 'Currently reading' : 'Start course'} </Link>
											</div>
											<div className="academy-course-list-elem-content">
												<h2>{tutorial.title}</h2>
												<ReactMarkdown source={tutorial.header} />
											</div>
											<div className="academy-course-list-elem-footer">
												<div className={`academy-part-count ${partsDone === tutorial.partCount ? 'done' : ''}`}>
													<span className="academy-part-count-progress" style={{'width': `${(partsDone / tutorial.partCount) * 100}%`}}></span>
													<span className="academy-part-count-text">{partsDone === tutorial.partCount ? 'COMPLETE' : `${partsDone} of ${tutorial.partCount}`}</span>
												</div>
												<div className="academy-readingtime">
													<img src="assets/images/icon-clock.svg" alt="readingTime icon"/> <span>{tutorial.readingTime} min</span>
												</div>
											</div>
										</Link>
									</div>
								);
							})
						}
				</div>
			</div>
		);
	}
}
