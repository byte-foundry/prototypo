import React from 'react';
import pleaseWait from 'please-wait';
import { LibrarySidebarRight, FamilySidebarActions } from './library-sidebars.components';
import FontUpdater from "../font-updater.components";
import LocalClient from '../../stores/local-client.stores';

export default class LibraryDetails extends React.PureComponent {
	constructor(props) {
		super(props)
		const family = props.baseFontData.find(e => e.id === props.params.projectID);
		if (!family) { props.history.push('/library/home') };
		this.state = {
			family,
		}
		this.goToDashboard = this.goToDashboard.bind(this);
	}
	componentWillMount() {
		pleaseWait.instance.finish();
	}
	goToDashboard() {
		this.props.history.push('/dashboard');
	}
	render() {
		return (
			<div className="library-content-wrapper">
				<div className="library-see">
					<div className="library-see-title">
						{this.state.family.name} family
						<div
							className={`provider provider-custom`}
							style={{ backgroundColor: this.state.family.background }}
						>
							{this.state.family.user.firstName && this.state.family.user.firstName.charAt(0)}
							{this.state.family.user.lastName && this.state.family.user.lastName.charAt(0)}
						</div>
					</div>
					<div className="library-details-form">
						<form action="" method="">
							<div className="library-details-form-elem">
								<label htmlFor="name">Family name</label>
								<input type="text" id="name" name="user_name" />
							</div>
							<div className="library-details-form-elem" />
							<div className="library-details-form-elem">
								<label htmlFor="mail">Designer</label>
								<input type="text" id="name" name="user_name" />
							</div>
							<div className="library-details-form-elem">
								<label htmlFor="msg">Designer URL</label>
								<input type="text" id="name" name="user_name" />
							</div>
							<div className="library-details-form-elem">
								<label htmlFor="msg">Foundry</label>
								<input type="text" id="name" name="user_name" />
							</div>
							<div className="library-details-form-elem">
								<label htmlFor="msg">Foundry URL</label>
								<input type="text" id="name" name="user_name" />
							</div>
						</form>
					</div>
					<div className="library-details-variants">
						<div className="details-header">
							<div className="details-header-elem">
								Styles settings
							</div>
							<div className="details-header-elem">
								Weight
							</div>
							<div className="details-header-elem">
								Width
							</div>
							<div className="details-header-elem">
								Italic
							</div>
							<div className="details-header-elem">&nbsp;</div>
						</div>
						{this.state.family && this.state.family.variants && this.state.family.variants.map((variant, index) => (
							<div className="details-form">
								<div className="details-form-elem">
									<input type="text" id="settings" name="style_settings" />
								</div>
								<div className="details-form-elem">
									<input type="text" id="weight" name="weight" />
								</div>
								<div className="details-form-elem">
									<input type="text" id="width" name="width" />
								</div>
								<div className="details-form-elem checkbox">
									<div className="checkbox">
										<input type="checkbox" id="italic" name="italic" />
										<label htmlFor="italic" />
									</div>
								</div>
								<div className="details-form-elem">
									<div className="button-remove">
										Remove
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
				<LibrarySidebarRight><FamilySidebarActions glyphs={this.state.family.glyphs} familyId={this.props.params.projectID} mode="details" /></LibrarySidebarRight>
			</div>
		);
	}
}
