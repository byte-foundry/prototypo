import React from 'react';
import {Link} from 'react-router';
import {LibrarySidebarRight} from './library-sidebars.components';
import LibraryButton from './library-button.components';

export default class LibraryHosting extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			hostedDomains: [],
			showCopiedMessage: false,
		};
		this.generateCss = this.generateCss.bind(this);
		this.copyToClipboard = this.copyToClipboard.bind(this);
	}

	copyToClipboard(hostedDomain) {
		const el = document.createElement('textarea');

		el.value = this.generateCss(hostedDomain);
		document.body.appendChild(el);
		el.select();
		document.execCommand('copy');
		document.body.removeChild(el);

		this.setState({
			showCopiedMessage: true,
		});
		const timerId = setTimeout(() => {
			this.setState({
				showCopiedMessage: false,
			});
		}, 3000);
	}

	generateCss(hostedDomain) {
		let familyData;
		let variantData;

		return `
			${hostedDomain.hostedVariants
		.map((hostedFont) => {
			switch (hostedFont.abstractedFont.type) {
			case 'PRESET':
				return `
						@font-face {
							font-family: '${hostedFont.abstractedFont.name}';
							font-style: normal;
							font-weight: 500;
							src: url(${hostedFont.url}) format("opentype");
						}
`;
			case 'TEMPLATE':
				return `
						@font-face {
							font-family: '${hostedFont.abstractedFont.name}';
							font-style: normal;
							font-weight: 500;
							src: url(${hostedFont.url}) format("opentype");
						}
`;
			case 'VARIANT':
				if (!hostedFont.abstractedFont.variant) {
					break;
				}
				familyData
								= this.props.families
								&& this.props.families.find(
									p => p.id === hostedFont.abstractedFont.variant.family.id,
								);
				variantData = familyData.variants.find(
					v => hostedFont.abstractedFont.variant.id,
				);
				return `
						@font-face {
							font-family: '${hostedFont.abstractedFont.name}';
							font-style: ${variantData.italic ? 'italic' : 'normal'};
							font-weight: ${variantData.weight};
							src: url(${hostedFont.url}) format("opentype");
						}
`;
			default:
				return '';
			}
		})
		.join('')}
`;
	}
	render() {
		return (
			<div className="library-content-wrapper">
				<div className="library-see">
					{/* <div className="library-hosting-plan">
						Free plan: 1000 views / month / website
					</div> */}
					<div className="library-hosting">
						{(!this.props.hostedDomains
							|| this.props.hostedDomains.length === 0) && (
							<div>
								<div className="library-see-title">There is nothing here!</div>
								<div className="library-see-description">
									<p>
										The pro plan allows you to host your fonts and keep them
										sync from your library. Lorem ipsum dolor sit amet,
										consectetur adipiscing elit. Cum sociis natoque penatibus et
										magnis dis parturient montes, nascetur ridiculus mus.
									</p>
									<p>
										<Link to="/library/hosting/create">
											Start using my fonts on the web
										</Link>
									</p>
								</div>
							</div>
						)}
						<div className="library-hosting-list">
							{this.props.hostedDomains
								&& this.props.hostedDomains.map(hostedDomain => (
									<div className="library-hosting-website">
										<p className="library-hosting-website-name">
											{hostedDomain.domain}
											<div
												className="button-edit"
												onClick={() => {
													this.props.router.push(
														`/library/hosting/${hostedDomain.id}/edit`,
													);
												}}
											>
												Edit
											</div>
											<div
												className="button-edit"
												onClick={() => {
													this.copyToClipboard(hostedDomain);
												}}
											>
												Copy CSS
											</div>
										</p>
										<div className="library-hosting-website-infos">
											<span>
												{hostedDomain.hostedVariants.length} hosted fonts
											</span>
											<span>
												Last update:{' '}
												{new Intl.DateTimeFormat('en-US').format(
													new Date(hostedDomain.updatedAt),
												)}
											</span>
										</div>
									</div>
								))}
						</div>
						{this.state.showCopiedMessage && (
							<p className="library-hosting-message">
								CSS copied to clipboard.
							</p>
						)}
					</div>
				</div>
				<LibrarySidebarRight>
					<LibraryButton
						name="Add a website"
						bold
						full
						onClick={() => {
							this.props.router.push('/library/hosting/create');
						}}
					/>
				</LibrarySidebarRight>
			</div>
		);
	}
}
