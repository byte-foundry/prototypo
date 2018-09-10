import React from 'react';
import {Link} from 'react-router';
import {LibrarySidebarRight} from './library-sidebars.components';

export default class LibraryFontsInUse extends React.Component {
	constructor(props) {
		super(props);
		const fontInUse = this.props.fontInUses.find(
			e => e.id === this.props.params.fontinuseID,
		);

		if (!fontInUse) {
			props.router.push('/library/fontinuse');
		}

		this.state = {
			fontInUse,
		};
	}
	renderFont(fontUsed) {
		switch (fontUsed.type) {
		case 'TEMPLATE':
			return <span className="library-fontinuse-font">{fontUsed.name}</span>;
		case 'PRESET':
			return <span className="library-fontinuse-font">{fontUsed.name}</span>;
		case 'VARIANT':
			return (
				<span className="library-fontinuse-font">
					<Link to={`/library/project/${fontUsed.family.id}`}>
						{fontUsed.name}
					</Link>
				</span>
			);
		default:
			return false;
		}
	}
	render() {
		return (
			<div className="library-content-wrapper">
				<div className="library-see">
					<div className="library-see-title">Font in use</div>
					<div className="library-fontinuse-list">
						{this.state.fontInUse && (
							<div className="library-fontinuse">
								<div className="library-fontinuse-left">
									{this.state.fontInUse.images.map(image => (
										<img src={`${image.replace('files.', 'images.')}/800x`} />
									))}
								</div>
								<div className="library-fontinuse-right">
									<p>
										<label>Client</label>
										<a href={this.state.fontInUse.clientUrl} target="_blank">
											{this.state.fontInUse.client}
										</a>
									</p>
									<p>
										<label>Related fonts</label>
										{this.state.fontInUse.fontUsed.map(fontUsed =>
											this.renderFont(fontUsed),
										)}
									</p>
									<p>
										<label>Designer</label>
										<a href={this.state.fontInUse.designerUrl} target="_blank">
											{this.state.fontInUse.designer}
										</a>
									</p>
									<p className="library-fontinuse-button">
										<Link
											to={`/library/fontinuse/${this.state.fontInUse.id}/edit`}
										>
											Edit
										</Link>
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
				<LibrarySidebarRight router={this.props.router}>
					<Link className="sidebar-action" to="/library/fontinuse/create">
						Add fontsinuse
					</Link>
				</LibrarySidebarRight>
			</div>
		);
	}
}
