import React from 'react';
import {Link} from 'react-router';
import TutorialContent from 'tutorial-content';
import ReactMarkdown from 'react-markdown';
import {findDOMNode} from 'react-dom';

export default class AcademyCourse extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			headers: [],
		};
		this.courseSlug = this.props.params.courseSlug;
		this.tutorials = new TutorialContent();
		this.stickyLevelTwo = this.stickyLevelTwo.bind(this);
		this.handleScroll = this.handleScroll.bind(this);
		this.bindData = this.bindData.bind(this);
	}

	componentDidMount() {
		this.bindData();
	}

	componentWillUnmount() {
		window.removeEventListener('scroll', this.handleScroll.bind(this), true);
	}

	componentDidUpdate(prevProps) {
		if (prevProps.params.courseSlug !== this.props.params.courseSlug) {
			window.removeEventListener('scroll', this.handleScroll.bind(this), true);
			this.courseSlug = this.props.params.courseSlug;
			this.bindData();
		}
	}

	getCoreProps(props) {
		return {
			'key': props.nodeKey,
			'data-sourcepos': props['data-sourcepos'],
		};
	}

	bindData() {
		findDOMNode(this).scrollIntoView();
		const course = this.tutorials.content.find((tutorial) => {
			return tutorial.slug === this.courseSlug;
		});
		const parts = course.content.split("## ");
		const headers = [];
		let basics = {};

		basics = {
			elem: findDOMNode(this.refs.academyCourseBasics),
			content: findDOMNode(this.refs.academyCourseContent),
			offset: findDOMNode(this.refs.academyCourseBasics).getBoundingClientRect().top,
		};

		parts.map((part, index) => {
			if (index !== 0) {
				headers.push({
					elem: findDOMNode(this.refs[`part${index + 1}`]).querySelector('h2'),
					offset: findDOMNode(this.refs[`part${index + 1}`]).querySelector('h2').getBoundingClientRect().top,
				});
			}
		});
		this.setState({headers, basics});
		window.addEventListener('scroll', this.handleScroll.bind(this), true);
	}

	handleScroll(event) {
		this.state.headers.map((header) => {
			event.target.scrollTop - 200 >= header.offset ? header.elem.classList.add('fixed')
                              : header.elem.classList.remove('fixed');
		});
		if (event.target.scrollTop - 200 >= this.state.basics.offset) {
			this.state.basics.elem.style.left = `${this.refs.academyCourseContent.getBoundingClientRect().right}px`;
			this.state.basics.elem.classList.add('fixed');
			this.state.basics.content.style.marginRight = '200px';
		}
		else {
			this.state.basics.elem.classList.remove('fixed');
			this.state.basics.content.style.marginRight = 'inherit';
		}
	}

	reduceChildren(children, child) {
		const lastIndex = children.length - 1;

		if (typeof child === 'string' && typeof children[lastIndex] === 'string') {
			children[lastIndex] += child;
		}
		else {
			children.push(child);
		}
		return children;
	}

	createElement(tagName, props, children) {
		const nodeChildren = Array.isArray(children) && children.reduce(this.reduceChildren, []);
		const args = [tagName, props].concat(nodeChildren || children);

		return React.createElement(...args);
	}

	stickyLevelTwo(props) {
		if (props.level === 2) {
			const levelTwoProps = {
				'key': props.nodeKey,
				'data-sourcepos': props['data-sourcepos'],
				'className': '',
			};

			return(
					<h2 {...levelTwoProps}>{props.children}</h2>
			);
		}
		else {
			return(
				this.createElement(`h${props.level}`, this.getCoreProps(props), props.children)
			);
		}
	}

	render() {
		const renderers = {
			Heading: this.stickyLevelTwo,
		};
		const course = this.tutorials.content.find((tutorial) => {
			return tutorial.slug === this.courseSlug;
		});
		const parts = course.content.split("## ");

		parts.map((part, index) => {
			if (index !== 0) {
				parts[index] = `## ${part}`;
			}
		});

		const basics = course.basics.length > 0 ? (
			<div>
				<h3>Basics</h3>
				<ul>
					{course.basics.map((basic) => {
						return (
							<li><Link to={`/academy/course/${basic.slug}`} > {basic.title} </Link></li>
						);
					})}
				</ul>
			</div>
		) : null;

		return(
			<div key={this.courseName} className="academy-base academy-course" ref="academyCoursePage">
				<div className="academy-course-courselist">
					<h3>Course List</h3>
					{
						this.tutorials.content.map((tutorial) => {
							return (
								<Link to={`/academy/course/${tutorial.slug}`} > {tutorial.title} </Link>
							);
						})
					}
				</div>
				<div className="academy-course-main">
					<div className="academy-course-main-content" ref="academyCourseContent">
						{parts.map((part, index) => {
							return (
									<ReactMarkdown source={part} renderers={renderers} ref={`part${index + 1}`}/>
							);
						})}
					</div>
					<div className="academy-course-main-basics" ref="academyCourseBasics">
						{basics}
					</div>
				</div>

			</div>
		);
	}
}
