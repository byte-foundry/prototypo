import React from 'react';
import {Link} from 'react-router';
import {LibrarySidebarRight} from './library-sidebars.components';
import LibraryButton from './library-button.components';

const isUrl = new RegExp(
	'^(https?:\\/\\/)?'
		+ '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'
		+ '((\\d{1,3}\\.){3}\\d{1,3}))'
		+ '(\\:\\d+)?'
		+ '(\\/[-a-z\\d%@_.~+&:]*)*'
		+ '(\\?[;&a-z\\d%@_.,~+&:=-]*)?'
		+ '(\\#[-a-z\\d_]*)?$',
	'i',
);

export default class LibraryFontsInUseList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	renderFont(fontUsed) {
		switch (fontUsed.type) {
		case 'TEMPLATE':
			return <span className="library-fontinuse-font">{fontUsed.name}</span>;
		case 'PRESET':
			return <span className="library-fontinuse-font">{fontUsed.name}</span>;
		case 'VARIANT':
			return fontUsed.variant ? (
				<span className="library-fontinuse-font">
					<Link to={`/library/project/${fontUsed.variant.family.id}`}>
						{fontUsed.name}
					</Link>
				</span>
			) : (
				<span className="library-fontinuse-font">{fontUsed.name}</span>
			);
		default:
			return false;
		}
	}
	render() {
		console.log(this.props.fontInUses);
		return (
			<div className="library-content-wrapper">
				<div className="library-see">
					{this.props.fontInUses && this.props.fontInUses.length === 0 ? (
						<div>
							<div className="library-see-title">No fonts in use yet.</div>
							<div className="library-see-description">
								<p>
									Create a font in use to keep track of your work and get easy
									access to the fonts you used.
								</p>
								<p>
									<Link to="/library/fontinuse/create">
										Create a font in use
									</Link>
								</p>
							</div>
						</div>
					) : (
						<div className="library-see-title">Fonts in use</div>
					)}

					<div className="library-fontinuse-list">
						{this.props.fontInUses
							&& this.props.fontInUses.map(fontInUse => (
								<div className="library-fontinuse">
									<div className="library-fontinuse-left">
										{fontInUse.images.map(image => (
											<img src={`${image.replace('files.', 'images.')}/800x`} />
										))}
									</div>
									<div className="library-fontinuse-right">
										<p>
											<label>Client</label>
											{isUrl.test(fontInUse.clientUrl) ? (
												<a href={`//${fontInUse.clientUrl}`} target="_blank">
													{fontInUse.client}
												</a>
											) : (
												<span>{fontInUse.client}</span>
											)}
										</p>
										<p>
											<label>Related fonts</label>
											{fontInUse.fontUsed.map(fontUsed =>
												this.renderFont(fontUsed),
											)}
										</p>
										<p>
											<label>Designer</label>
											{isUrl.test(fontInUse.designerUrl) ? (
												<a href={`//${fontInUse.designerUrl}`} target="_blank">
													{fontInUse.designer}
												</a>
											) : (
												<span>{fontInUse.designer}</span>
											)}
										</p>
										<p className="library-fontinuse-button">
											<Link to={`/library/fontinuse/${fontInUse.id}/edit`}>
												Edit
											</Link>
										</p>
									</div>
								</div>
							))}
					</div>
				</div>
				<LibrarySidebarRight router={this.props.router}>
					<LibraryButton
						name="Add fontsinuse"
						bold
						full
						onClick={() => {
							this.props.router.push('/library/fontinuse/create');
						}}
					/>
				</LibrarySidebarRight>
			</div>
		);
	}
}
