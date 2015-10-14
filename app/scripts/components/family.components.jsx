import React from 'react';
import Classnames from 'classnames';
import Lifespan from 'lifespan';
import {VariantList} from './variant.components.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import ReactGeminiScrollbar from 'react-gemini-scrollbar';
import Log from '../services/log.services.js';
import JSZip from 'jszip';
import {FontValues} from '../services/values.services.js';
import {Typefaces} from '../services/typefaces.services.js';

export class FamilyList extends React.Component {

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
		const families = this.client.fetch('/fontLibrary');

		this.client.getStore('/fontLibrary', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					families: head.toJS().fonts,
				});
			})
			.onDelete(() => {
				this.setState({
					families: undefined,
				});
			});

		this.setState({
			families:families.fonts,
		});

		this.variants = [
			'THIN', //20
			'THIN ITALIC',
			'LIGHT', //50
			'LIGHT ITALIC',
			'BOOK', //70
			'BOOK ITALIC',
			'REGULAR',
			'REGULAR ITALIC',
			'SEMI-BOLD', //100
			'SEMI-BOLD ITALIC',
			'BOLD', //115
			'BOLD ITALIC',
			'EXTRA-BOLD', //135
			'EXTRA-BOLD ITALIC',
			'BLACK', //150
			'BLACK ITALIC',
		]
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		const families = _.map(this.state.families, (family) => {
			if (this.props.selected && family.name === this.props.selected.name) {
				return <Family key={family.name} data={family} selected={true} variantSelected={this.props.variantSelected}/>
			}
			else {
				return <Family key={family.name} data={family} selected={false}/>
			}
		});

		const suggestions = _.map(this.variants, (suggestion) => {
			return <option key={suggestion} className="text-suggestion-list-item" value={suggestion}/>;
		});

		return (
			<div className="family-list">
				<div className="family-list-scroll">
					<ReactGeminiScrollbar>
						{families}
					</ReactGeminiScrollbar>
				</div>
				<datalist id="suggestions">
					{suggestions}
				</datalist>
			</div>
		);
	}
}

export class Family extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}
	componentDidMount() {
		this.height = React.findDOMNode(this.refs.list).clientHeight;
	}

	componentDidUpdate() {
		this.height = React.findDOMNode(this.refs.list).clientHeight;
	}

	toggleList() {
		this.setState({
			listOpen:!this.state.listOpen
		});
	}

	async downloadFamily(e) {
		e.stopPropagation();

		const fontVariant = await this.client.fetch('/fontVariant');
		const variant = fontVariant.get('variant');
		const family = fontVariant.get('family');
		fontInstance.exportingZip = true;
		fontInstance._queue = [];

		this.client.dispatchAction('/change-font',{
			template: this.props.data.template,
			db: 'default',
		});

		const zip = new JSZip();
		const a = document.createElement('a');
		const blobs = [];
		for(let i = 0; i < this.props.data.variants.length; i++) {
			const currVariant = this.props.data.variants[i];
			blobs.push(await this.generateVariantBlob(currVariant.db, this.props.data.name, currVariant.name));
		}

		_.each( blobs, ({buffer, variant}) => {
			zip.file(`${variant}.otf`, buffer, {binary: true});
		});

		const reader = new FileReader();
		const _URL = window.URL || window.webkitURL;

		reader.onloadend = () => {
			a.download = this.props.data.name + '.zip';
			a.href = reader.result;
			a.dispatchEvent(new MouseEvent('click'));

			setTimeout(() => {
				a.href = '#';
				_URL.revokeObjectURL( reader.result );
			}, 100);
			fontInstance.exportingZip = false;
			this.client.dispatchAction('/change-font',{
				template: this.props.data.template,
				db: variant.db,
			});
		};

		reader.readAsDataURL(zip.generate({type: "blob"}));
	}

	async generateVariantBlob(db, family, style) {
		const values = await FontValues.get({typeface: db});
		return await fontInstance.getBlob(null , { family, style }, false, values.values);
	}

	toggleConfirmDelete(e) {
		e.stopPropagation();
		this.setState({
			confirmDeletion: !this.state.confirmDeletion,
		});
	}

	deleteFamily(e) {
		e.stopPropagation();
		this.client.dispatchAction('/delete-family', {family: this.props.data});
		Log.ui('Collection.deleteFamily');
	}

	resetHeader() {
		this.setState({
			confirmDeletion:false,
		});
	}

	render() {
		const listStyle = {
			height: this.state.listOpen ? `${this.height}px` : '0px',
		};

		const classes = Classnames({
			family: true,
			'is-active': this.props.selected,
		});

		const deleteClasses = Classnames({
			'family-header-delete': true,
			'is-confirm': this.state.confirmDeletion,
		});

		return (
			<div className={classes}>
				<div className="family-header" onClick={() => {this.toggleList()} } onMouseLeave={() => {this.resetHeader()}}>
					<div className="family-header-left">
						<div className="family-header-left-logo"></div>
						<div className="family-header-left-title">
							<div className="family-header-left-title-name">
								{this.props.data.name}
							</div>
							<div className="family-header-left-title-number-variants">
								{this.props.data.variants.length} variants
							</div>
						</div>
					</div>
					<div className="family-header-delete-btn" onClick={(e) => {this.downloadFamily(e)}}>
						DOWNLOAD
					</div>
					<div className={deleteClasses}>
						<div className="family-header-delete-btn" onClick={(e) => {this.toggleConfirmDelete(e)}}>
							DELETE
						</div>
						<div className="family-header-delete-confirm">
							DELETE THIS FAMILY ?
							<div className="family-header-delete-confirm-button" onClick={(e) => {this.deleteFamily(e)}}>YES</div>
							<div className="family-header-delete-confirm-button" onClick={(e) => {this.toggleConfirmDelete(e)}}>NO</div>
						</div>
					</div>
				</div>
				<div className="family-variant-list" style={listStyle}>
					<VariantList variants={this.props.data.variants} selected={this.props.variantSelected} family={this.props.data} ref="list"/>
				</div>
			</div>
		);
	}
}

export class AddFamily extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			fonts:[],
		};
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
		const templateList = await this.client.fetch('/templateList');

		this.client.getStore('/fontLibrary', this.lifespan)
		.onUpdate(({head}) => {
				if (head.toJS().errorAddFamily != this.state.error) {
					this.setState({
						error: head.toJS().errorAddFamily,
					});
				}
				if (head.toJS().errorAddFamily === undefined) {
					this.setState({
						showForm: false,
						selectedFont: undefined,
						reset: (new Date()).getTime(),
					});
				}
			})
			.onDelete(() => {
				this.setState({
					error:undefined,
				});
			});

		this.setState({
			fonts: templateList.get('list'),
		});
	}

	componentWillUnmount() {
		this.client.dispatchAction('/clear-error-family');

		this.lifespan.release();
	}

	toggleForm(e, state) {
		e.stopPropagation();
		this.setState({
			error:undefined,
			showForm: state,
		});

		if (state) {
			setTimeout(() => {
				React.findDOMNode(this.refs.name).focus();
			}, 100);
		}
	}

	selectFont(font) {
		this.setState({
			selectedFont:font,
		});
	}

	createFont(e) {
		e.stopPropagation();
		this.client.dispatchAction('/create-family',{
			name:React.findDOMNode(this.refs.name).value,
			template:this.state.selectedFont ? this.state.selectedFont.templateName : undefined,
			loadCurrent: this.state.selectedFont ? this.state.selectedFont.loadCurrent : false,
		});
		Log.ui('Collection.CreateFamily');
	}

	render() {

		const familyClass = Classnames({
			'add-family': true,
			'family-form-open': this.state.showForm,
			'with-error': !!this.state.error,
		});

		const templateList = _.map(this.state.fonts,(font) => {
			return (
				<FamilyTemplateChoice
					key={font.name}
					selectedFont={this.state.selectedFont}
					font={font}
					chooseFont={(selectedFont) => {this.selectFont(selectedFont)}}/>
			);
		})

		const error = this.state.error ? <div className="add-family-form-error">{this.state.error}</div> : false;

		return (
			<div className={familyClass} onClick={(e) => {this.toggleForm(e, true)} }>
				<div className="add-family-header">
					<h1 className="add-family-header-label">
						Create a new Family
					</h1>
				</div>
				<div className="add-family-form">
					<div className="add-family-form-header">
						<h1 className="add-family-form-header-title">Creating a new Family</h1>
						<img className="add-family-form-header-close" onClick={(e) => {this.toggleForm(e, false)}} src="/assets/images/close-icon.svg"/>
					</div>
					<label className="add-family-form-label"><span className="add-family-form-label-order">1. </span>Choose a family name</label>
					<input ref="name" className="add-family-form-input" key={this.state.reset} type="text" placeholder="My new typeface"></input>
					<label className="add-family-form-label"><span className="add-family-form-label-order">2. </span>Choose a font template</label>
					<div className="add-family-form-template-list">
						{templateList}
					</div>
					{error}
					<button className="add-family-form-button" onClick={(e) => {this.createFont(e)} }>Create</button>
				</div>
			</div>
		)
	}
}

export class FamilyTemplateChoice extends React.Component {
	render() {
		const classes = Classnames({
			'family-template-choice': true,
			'is-active': this.props.selectedFont && this.props.selectedFont.name === this.props.font.name,
		});

		return (
			<div className={classes} onClick={() => {this.props.chooseFont(this.props.font)}}>
				<div className="family-template-choice-sample">
					<img src={`/assets/images/${this.props.font.sample}`} />
				</div>
				<div className="family-template-choice-name">
					{this.props.font.name}
				</div>
			</div>
		)
	}
}
