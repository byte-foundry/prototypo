import PropTypes from 'prop-types';
import React from 'react';
import {Link, browserHistory} from 'react-router';
import TutorialContent from 'tutorial-content';
import ReactMarkdown from 'react-markdown';
import {findDOMNode} from 'react-dom';
import InlineSVG from 'svg-inline-react';
import Button from '../shared/new-button.components';
import ScrollArea from 'react-scrollbar/dist/no-css';

class AcademyCourse extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			stickedIndex: -1,
			headers: [],
			scrollPercent: 0,
		};

		this.tutorials = new TutorialContent();
		this.headerRenderer = this.headerRenderer.bind(this);
		this.imgRenderer = this.imgRenderer.bind(this);
		this.linkRenderer = this.linkRenderer.bind(this);
		this.htmlRenderer = this.htmlRenderer.bind(this);
		this.handleScroll = this.handleScroll.bind(this);
		this.bindData = this.bindData.bind(this);
		this.scrollToPart = this.scrollToPart.bind(this);
		this.isPartRead = this.isPartRead.bind(this);
		this.isCourseDone = this.isCourseDone.bind(this);
		this.areAllPartsRead = this.areAllPartsRead.bind(this);
		this.getNextCourse = this.getNextCourse.bind(this);
		this.loadCourse = this.loadCourse.bind(this);
	}

	componentWillMount() {
		this.loadCourse(this.props.params.courseSlug);
	}

	componentDidMount() {
		this.bindData();
	}

	componentWillReceiveProps(newProps) {
		if (newProps.params.courseSlug !== this.courseSlug) {
			window.removeEventListener('scroll', this.handleScroll, true);
			this.loadCourse(newProps.params.courseSlug);
			this.state = {
				stickedIndex: -1,
				headers: [],
				scrollPercent: 0,
			};
		}
	}

	componentDidUpdate(prevProps) {
		if (prevProps.params.courseSlug !== this.props.params.courseSlug) {
			this.bindData();
		}
	}

	componentWillUnmount() {
		window.removeEventListener('scroll', this.handleScroll, true);
	}

	getCoreProps(props) {
		return {
			key: props.nodeKey,
			'data-sourcepos': props['data-sourcepos'],
		};
	}

	loadCourse(slug) {
		this.courseSlug = slug;
		this.course = this.tutorials.content.find(tutorial => tutorial.slug === this.courseSlug);

		if (!this.course) {
			// invalid courseSlug supplied, redirect.
			browserHistory.push('/#/academy/home');
			return;
		}

		window.Intercom('trackEvent', `openedAcademyCourse-${this.courseSlug}`);
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

		return React.createElement(tagName, props, nodeChildren || children);
	}

	bindData() {
		document.getElementsByClassName('academy-app')[0].scrollTop = 0;
		const course = this.tutorials.content.find(tutorial => tutorial.slug === this.courseSlug);

		if (!course) {
			// invalid courseSlug supplied, redirect.
			browserHistory.push('/#/academy/home');
			return false;
		}
		const parts = course.content.split(/[^\#]#{2} +/g);
		let sidebar = {};

		document.querySelector('.academy-course-main-sidebar').classList.remove('fixed');
		sidebar = {
			elem: document.querySelector('.academy-course-main-sidebar'),
			content: this.courseContentDom,
			offset: document.querySelector('.academy-course-main-sidebar').getBoundingClientRect().top,
			width: document.querySelector('.academy-course-main-sidebar').offsetWidth,
		};

		const headers = parts.slice(1).map((part, index) => {
			const elem = findDOMNode(this.refs[`${this.courseSlug}-part${index + 2}`]).querySelector(
				'.title',
			);

			elem.classList.remove('fixed');
			return {
				elem,
				offset: elem.getBoundingClientRect().top,
				content: elem.textContent,
				active: false,
			};
		});

		if (parts.length === 1) {
			this.markAsRead(parts[0].content);
		}
		this.setState({...this.state, headers, sidebar, course});

		const currentProgress = this.props.academyProgress[this.courseSlug];
		if ((!currentProgress || !currentProgress.completed) && parts.length > 0) {
			this.props.setCourseCurrentlyReading(this.courseSlug);
		}
		window.addEventListener('scroll', this.handleScroll, true);

		if (this.props.params.partName) {
			this.scrollToPart(this.props.params.partName, headers);
		}
	}

	handleScroll(event) {
		const {headers} = this.state;
		let {stickedIndex} = this.state;

		// Headers handling
		const updatedHeaders = headers.map((header, index) => {
			if (event.target.scrollTop >= header.offset) {
				stickedIndex = index;
			}

			return {
				...header,
				active: false,
			};
		});

		if (stickedIndex === 0 && event.target.scrollTop <= updatedHeaders[0].offset) {
			stickedIndex = -1;
		}
		if (updatedHeaders[stickedIndex]) {
			updatedHeaders[stickedIndex].active = true;
		}
		this.setState({
			headers,
			stickedIndex,
			scrollPercent: Math.round(
				event.target.scrollTop
					/ (document.getElementsByClassName('academy-course-main')[0].offsetHeight - 850)
					* 100,
			),
		});

		// Logo sticky handling
		if (event.target.scrollTop >= this.state.sidebar.offset - 130) {
			document.getElementsByClassName('academy-dashboard-icon')[0].classList.add('fixed');
			document.getElementsByClassName(
				'academy-dashboard-icon',
			)[0].style.left = `${this.courseContentDom.getBoundingClientRect().left - 75}px`;
		}
		else {
			document.getElementsByClassName('academy-dashboard-icon')[0].classList.remove('fixed');
			document.getElementsByClassName('academy-dashboard-icon')[0].style.left = 'inherit';
		}

		// Sidebar sticky handling
		if (event.target.scrollTop >= this.state.sidebar.offset) {
			this.state.sidebar.elem.classList.add('fixed');
			document.getElementsByClassName('academy-dashboard-icon')[0].classList.add('fixed');
			document.getElementsByClassName(
				'academy-dashboard-icon',
			)[0].style.left = `${this.courseContentDom.getBoundingClientRect().left - 75}px`;
			this.state.sidebar.elem.style.left = `${this.courseContentDom.getBoundingClientRect().right
				+ 20}px`;
		}
		else {
			this.state.sidebar.elem.classList.remove('fixed');
			this.state.sidebar.elem.style.left = 'inherit';
		}
	}

	headerRenderer(props) {
		if (props.level === 2 && props.children.length > 0) {
			const levelTwoProps = {
				key: props.nodeKey,
				'data-sourcepos': props['data-sourcepos'],
			};

			const partTitle = props.children[0];

			return (
				<div id={partTitle} className="title" {...levelTwoProps}>
					<input
						type="checkbox"
						className="title-checkbox"
						id={`${this.courseSlug}-${props.children}`}
						name={`${this.courseSlug}-${props.children}`}
						checked={this.isPartRead(partTitle)}
						key={`${this.courseSlug}-${props.children}`}
						onChange={() => this.markAsRead(partTitle)}
					/>
					<label htmlFor={`${this.courseSlug}-${props.children}`}>
						<span />
						{props.children}
					</label>
				</div>
			);
		}
		return this.createElement(`h${props.level}`, this.getCoreProps(props), props.children);
	}

	imgRenderer(props) {
		const {src, alt} = props;
		const urlRegexp = /([a-z]+\:\/+)([^\/\s]*)([a-z0-9\-@\^=%&;\/~\+]*)[\?]?([^ \#]*)#?([^ \#]*)/gi;

		if (!src.match(urlRegexp) && this.state.course) {
			return (
				<img src={`assets/images/academy/courses/${this.state.course.title}/${src}`} alt={alt} />
			);
		}
		return <img src={src} alt={alt} />;
	}

	linkRenderer(props) {
		const {href, children} = props;

		if (href.includes('/academy')) {
			return (
				<Link to={href}>
					{children}
				</Link>
			);
		}
		return (
			<a target="_blank" href={href} className="out">
				{children}
			</a>
		);
	}

	htmlRenderer(props) {
		let literal = props.literal;

		if (literal.includes('<video') && this.state.course) {
			const getAttributes = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g;
			const urlRegexp = /([a-z]+\:\/+)([^\/\s]*)([a-z0-9\-@\^=%&;\/~\+]*)[\?]?([^ \#]*)#?([^ \#]*)/gi;
			let regexResult;
			let returnstring = '<video ';

			while ((regexResult = getAttributes.exec(props.literal)) !== null) {
				if (regexResult[1] === 'src') {
					if (regexResult[2].match(urlRegexp)) {
						returnstring = `${returnstring} ${regexResult[0]}`;
					}
					else {
						returnstring = `${returnstring} ${regexResult[1]}="assets/images/academy/courses/${this
							.state.course.title}/${regexResult[2]}"`;
					}
				}
				else {
					returnstring = `${returnstring} ${regexResult[0]}`;
				}
			}
			literal = `${returnstring}>`;
		}
		const nodeProps = props.escapeHtml ? {} : {dangerouslySetInnerHTML: {__html: literal}};
		const children = props.escapeHtml ? [props.literal] : null;

		if (props.escapeHtml || !props.skipHtml) {
			return this.createElement(props.isBlock ? 'div' : 'span', nodeProps, children);
		}
	}

	scrollToPart(partName, headers) {
		const coursePart = headers.find(elem => elem.content === partName);

		if (coursePart) {
			coursePart.elem.scrollIntoView();
		}
	}

	markAsRead(partTitle) {
		const progress = {
			// default attributes
			slug: this.course.slug,
			name: this.course.title,
			rewarded: false,
			completed: false,
			parts: this.course.content.split(/[^\#]#{2} +/g).slice(1).map(value => ({
				name: value.split(/\r\n|\r|\n/g)[0],
				completed: false,
			})),

			...this.props.academyProgress[this.courseSlug],
		};

		const updatedParts = progress.parts.map((part) => {
			if (part.name === partTitle) {
				return {...part, completed: !part.completed};
			}

			return part;
		});

		this.props.saveCourseProgress({
			...progress,
			parts: updatedParts,
		});
	}

	isPartRead(part) {
		const course = this.props.academyProgress[this.courseSlug];

		return !!(course && !!course.parts.find(p => p.name === part && p.completed));
	}

	isCourseDone(slug) {
		const course = this.props.academyProgress[slug];

		return course && course.parts.every(p => p.completed);
	}

	areAllPartsRead() {
		const progress = this.props.academyProgress[this.courseSlug];

		return progress && progress.parts && progress.parts.every(p => p.completed);
	}

	getNextCourse() {
		return this.tutorials.content[
			this.tutorials.content.findIndex(tutorial => tutorial.slug === this.courseSlug) + 1
		];
	}

	render() {
		const renderers = {
			Heading: this.headerRenderer,
			Image: this.imgRenderer,
			Link: this.linkRenderer,
			HtmlInline: this.htmlRenderer,
		};
		const course = this.tutorials.content.find(tutorial => tutorial.slug === this.courseSlug);

		if (!course) {
			// invalid courseSlug supplied, redirect.
			browserHistory.push('/#/academy/home');
			return false;
		}
		const parts = course.content.split(/[^\#]#{2} +/g);
		const partsName = parts.map(part => part.split(/\r\n|\r|\n/g)[0]);

		parts.map((part, index) => {
			if (index !== 0) {
				parts[index] = `## ${part}`;
			}
		});

		const basics
			= course.basics.length > 0
			&& <div>
				<h3>Basics</h3>
				{course.basics.map(basic =>
					(<Link
						key={basic.slug}
						className="academy-sidebar-menu-item"
						to={`/academy/course/${basic.slug}`}
					>
						{basic.title}
					</Link>),
				)}
			</div>;
		const partsDisplay
			= this.state.headers.length > 0
			&& <div>
				<h3>Parts</h3>
				{this.state.headers.map(header =>
					(<a
						href={`#/academy/${course.slug}/${header.content}`}
						key={header.content}
						className={`academy-sidebar-menu-item ${header.active ? 'is-active' : ''}`}
						onClick={(e) => {
							e.preventDefault();
							header.elem.scrollIntoView();
						}}
					>
						<span
							className={`academy-sidebar-menu-item-checkmark ${this.isPartRead(header.content)
								? 'active'
								: ''}`}
						/>
						<span>
							{header.content}
						</span>
					</a>),
				)}
			</div>;
		const sidebar = (
			<ScrollArea
					className="academy-course-main-sidebar"
					contentClassName="academy-course-main-sidebar-content"
					horizontal={false}
			>
				<progress value={this.state.scrollPercent} max="100" />
				{basics}
				{partsDisplay}
				<h3>Other courses</h3>
				<div
					className="academy-course-courselist"
					ref={(courseListDom) => {
						this.courseListDom = courseListDom;
					}}
				>
					<Link className="academy-sidebar-menu-item" to={'/academy/home'}>
						<span className="academy-sidebar-menu-item-home-icon" />
						Academy homepage
					</Link>
					{this.tutorials.content
						.sort((a, b) => {
							const dateA = new Date(a.date).getTime();
							const dateB = new Date(b.date).getTime();

							return dateA > dateB ? 1 : -1;
						})
						.map(tutorial =>
							(<Link
								key={tutorial.slug}
								className={`academy-sidebar-menu-item ${tutorial.slug === this.courseSlug
									? 'is-active'
									: ''}`}
								to={`/academy/course/${tutorial.slug}`}
							>
								<span
									className={`academy-sidebar-menu-item-checkmark ${this.isCourseDone(tutorial.slug)
										? 'is-done'
										: ''} ${tutorial.slug === this.courseSlug ? 'is-active' : ''}`}
								/>
								{tutorial.title}
							</Link>),
						)}
				</div>
			</ScrollArea>
		);

		let finish = false;

		if (this.areAllPartsRead() && this.state.headers) {
			finish = (
				<div className="academy-course-finish">
					<InlineSVG
						className="academy-course-finish-icon"
						element="div"
						src={require('!svg-inline-loader!../../../images/academy/cup.svg')}
					/>
					<div className="academy-course-finish-text">
						{this.getNextCourse()
							? <p>
									Good Job, you have learned {course.objective}
									. Do you want to learn {this.getNextCourse().objective}
									? Check out our next course: {this.getNextCourse().title}
									.
								</p>
							: <p>
								{' '}Good Job, you have learned {course.objective} We do not have anything else to
									teach you yet. Stay tuned for more!
								</p>}
					</div>
					<div className="academy-course-finish-validation">
						<Link
							to={
								this.getNextCourse()
									? `/academy/course/${this.getNextCourse().slug}`
									: '/academy/home'
							}
						>
							<div className="academy-button">
								{this.getNextCourse() ? 'Sure!' : 'Go back to the homepage'}
							</div>
						</Link>
					</div>
				</div>
			);
		}

		return (
			<div
				key={this.courseName}
				className={`academy-base academy-course ${course.isVideo ? 'is-video' : ''}`}
			>
				<div className="academy-course-main">
					<div
						className="academy-course-main-content"
						ref={(courseContentDom) => {
							this.courseContentDom = courseContentDom;
						}}
					>
						{parts.map((part, index) =>
							(<div key={index} className="academy-course-main-content-part clearfix">
								<ReactMarkdown
									source={part}
									renderers={renderers}
									ref={`${this.courseSlug}-part${index + 1}`}
								/>
								{index > 0
									&& <Button
										className="part-progress-complete-button"
										size="large"
										outline
										disabled={this.isPartRead(partsName[index])}
										onClick={() => this.markAsRead(partsName[index])}
									>
										{this.isPartRead(partsName[index])
											? 'Part finished'
											: index === parts.length - 1
												? 'I finished the last part!'
												: 'I finished! On to the next part'}
									</Button>}
							</div>),
						)}
					</div>
					{sidebar}
				</div>
				{finish}
			</div>
		);
	}
}

AcademyCourse.defaultProps = {
	setCourseCurrentlyReading: () => {},
};

AcademyCourse.propTypes = {
	params: PropTypes.object.isRequired,
	academyProgress: PropTypes.shape({
		lastCourse: PropTypes.string,
	}),
	markPartAsRead: PropTypes.func,
	setCourseCurrentlyReading: PropTypes.func,
	saveCourseProgress: PropTypes.func,
};

export default AcademyCourse;
