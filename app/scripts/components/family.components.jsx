import React from 'react';
import Classnames from 'classnames';
import Lifespan from 'lifespan';
import {VariantList} from './variant.components.jsx';
import LocalClient from '../stores/local-client.stores.jsx';

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
				{families}
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

	toggleConfirmDelete(e) {
		e.stopPropagation();
		this.setState({
			confirmDeletion: !this.state.confirmDeletion,
		});
	}

	deleteFamily(e) {
		e.stopPropagation();
		this.client.dispatchAction('/delete-family', {family: this.props.data});	
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
				<div className="family-header" onClick={() => {this.toggleList()} }>
					<div className="family-header-left">
						<div className="family-header-left-logo">
							<img src="/assets/images/project-icon.svg"/>	
						</div>
						<div className="family-header-left-title">
							<div className="family-header-left-title-name">
								{this.props.data.name}
							</div>
							<div className="family-header-left-title-number-variants">
								{this.props.data.variants.length} variants
							</div>
						</div>
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
		const templateList = await this.client.fetch('/templateList');

		this.setState({
			fonts: templateList.get('list'),
		});
	}

	toggleForm(e, state) {
		e.stopPropagation();
		this.setState({
			showForm: state,
		});
	}

	selectFont(font) {
		this.setState({
			selectedFont:font,
		});
	}

	createFont() {
		this.client.dispatchAction('/create-family',{
			name:React.findDOMNode(this.refs.name).value,
			template:this.state.selectedFont.templateName,
		});
	}

	render() {

		const familyClass = Classnames({
			'add-family': true,
			'family-form-open': this.state.showForm,
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

		return (
			<div className={familyClass} onClick={(e) => {this.toggleForm(e, true)} }>
				<div className="add-family-header">
					<img src="/assets/images/add-icon.svg" className="add-family-header-icon"/>
					<div className="add-family-header-label">
						Create a new Family
					</div>
				</div>
				<div className="add-family-form">
					<div className="add-family-form-header">
						<div className="add-family-form-header-title">Creating a new Family</div>
						<img src="/assets/images/close-icon.svg" className="add-family-form-header-close" onClick={(e) => {this.toggleForm(e,false)} }/>
					</div>
					<label className="add-family-form-label">Family name</label>
					<input ref="name" className="add-family-form-input" type="text"></input>
					<h2>Choose a font template</h2>
					<div className="add-family-form-template-list">
						{templateList}
					</div>
					<button onClick={() => {this.createFont()} }>Create</button>
				</div>
			</div>
		)
	}
}

export class FamilyTemplateChoice extends React.Component {
	render() {
		const style = {
			'font-family': this.props.font.familyName,
		}

		const classes = Classnames({
			'family-template-choice': true,
			'is-active': this.props.selectedFont && this.props.selectedFont.name === this.props.font.name,
		});

		return (
			<div className={classes} style={style} onClick={() => {this.props.chooseFont(this.props.font)}}>
				<div className="family-template-choice-sample">
					{this.props.font.sample}
				</div>
				<div className="family-template-choice-name">
					{this.props.font.name}
				</div>
			</div>
		)
	}
}
