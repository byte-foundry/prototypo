import React from 'react';
import pleaseWait from 'please-wait';
import { LibrarySidebarRight, FamilySidebarActions } from './library-sidebars.components';
import FontUpdater from "../font-updater.components";
import LocalClient from '../../stores/local-client.stores';

export default class LibrarySee extends React.PureComponent {
	constructor(props) {
		super(props)
		const family = props.baseFontData.find(e => e.id === props.params.projectID);
		if(!family) {props.history.push('/library/home')};
		let fontsToGenerate = [];
		family.variants.forEach(variant => {
			const templateInfo = props.templateInfos.find(template => template.templateName === family.template) || {name: 'Undefined'};
			fontsToGenerate.push(
				{
					name: `variant${variant.id}`,
					template: templateInfo.templateName,
					subset: 'Hamburgefonstiv 123',
					values: {
						...props.templateValues[templateInfo.templateName],
						...variant.values
					},
				}
			);
		})
		this.state = {
			family,
			fontsToGenerate
		}
		this.goToDashboard = this.goToDashboard.bind(this);
	}
	goToDashboard() {
		this.props.history.push('/dashboard');
	}
	componentWillMount() {
		pleaseWait.instance.finish();
	}

	render() {
		return (			
			<div className="library-content-wrapper">
				<div className="library-see">
					<div className="library-see-title">
						{this.state.family.name} family
						<div
							className={`provider provider-custom`}
							style={{backgroundColor: this.state.family.background}}
						>
							{this.state.family.user.firstName && this.state.family.user.firstName.charAt(0)}
							{this.state.family.user.lastName && this.state.family.user.lastName.charAt(0)}
						</div>
					</div>
					<div className="library-see-variants">
						{this.state.family && this.state.family.variants && this.state.family.variants.map((variant, index) => (
							<VariantItem
								key={`variantItem${variant.id}`}
								variant={variant} family={this.state.family}
								goToDashboard={this.goToDashboard}
								values={this.state.fontsToGenerate[index].values}
								template={this.state.fontsToGenerate[index].template}
							/>
						))}
					</div>
					<FontUpdater extraFonts={this.state.fontsToGenerate} />
				</div>
				<LibrarySidebarRight><FamilySidebarActions glyphs={this.state.family.glyphs} familyId={this.props.params.projectID} mode="see" /></LibrarySidebarRight>
			</div>
		);
	}
}

export class VariantItem extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isOpen: false,
		}
		this.open = this.open.bind(this);
		this.export = this.export.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	open() {
		this.client.dispatchAction('/select-variant', {
			selectedVariant: this.props.variant,
			family: this.props.family,
		});
		this.props.goToDashboard();
	}

	export() {
		console.log(this.props.family)
		this.client.dispatchAction('/export-otf-from-library', {
			merged: true,
			familyName: this.props.family.name,
			variantName: this.props.variant.name,
			exportAs: false,
			values: this.props.values,
			template: this.props.template,
			glyphs: this.props.family.glyphs,
		});
	}

	render() {
		console.log(this.props.family)
		return (
			<div className="library-item">
				<p className="library-item-name">
					{this.props.family.name} {this.props.variant.name}
				</p>
				<p
					className="library-item-preview" 
					style={{fontFamily: `variant${this.props.variant.id}`}}
					onClick={() => {this.setState({isOpen: !this.state.isOpen});}}
				>
					Hamburgefonstiv 123
				</p>
				<div className={`library-item-variant-actions ${this.state.isOpen ? 'opened' : ''}`}>
					<div className="library-item-variant-actions-group">
						<div className="library-item-variant-actions-group-title">
							Actions
						</div>
						<div className="library-item-variant-action" onClick={() => {this.open();}}>
							Open variant
						</div>
						<div className="library-item-variant-action" onClick={() => {this.export();}}>
							Export variant
						</div>
						<div className="library-item-variant-action">
							Rename variant
						</div>
						<div className="library-item-variant-action">
							Duplicate variant
						</div>
						<div className="library-item-variant-action">
							Delete variant
						</div>
					</div>
				</div>
			</div>
		)
	}
}
