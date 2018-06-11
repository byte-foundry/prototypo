import React from 'react';
import pleaseWait from 'please-wait';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import Lifespan from 'lifespan';
import LocalClient from '../../stores/local-client.stores';
import ScrollArea from 'react-scrollbar/dist/no-css';
import FontUpdater from "../font-updater.components";
import {graphql, gql, compose} from 'react-apollo';
import { LibrarySidebarRight, SidebarFilters } from './library-sidebars.components';

class LibraryList extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {};
	}	

	render() {
		return (
			<div className="library-content-wrapper">
				<div className="library-list">
					<FamilyList fontsToGenerate={this.props.fontsToGenerate} fontsToDisplay={this.props.fontsToDisplay}/>
				</div>
				<LibrarySidebarRight><SidebarFilters setActiveFilters={this.props.setActiveFilters}/></LibrarySidebarRight>
			</div>
		);
	}
}



LibraryList.propTypes = {
	families: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string,
		name: PropTypes.string,
		template: PropTypes.string,
	})).isRequired,
};

LibraryList.defaultProps = {
	families: [],
};

export default LibraryList;

class FamilyList extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {}		
	}
	

	render() {
		return (
			<ScrollArea
				className="library-list-families"
				contentClassName="library-list-families-content"
				horizontal={false}
				style={{overflowX: 'visible'}}
			>
				<div className="library-family-list">
					{this.props.fontsToDisplay && this.props.fontsToDisplay.map(font => font.elem)}
					<FontUpdater extraFonts={this.props.fontsToGenerate} />
				</div>
			</ScrollArea>			
		)
	}
}

export class TemplateItem extends React.PureComponent {
	constructor(props) {
		super(props)	
		this.state = {
			isOpen: false,
		}	
	}

	render() {
		return (
			<div className="library-item" tabIndex={0} onBlur={() => {this.setState({isOpen: false})}}>
				<p className="library-item-name">
					{this.props.template.name}
				</p>
				<p
					className="library-item-preview"
					style={{fontFamily: `template${(this.props.template.templateName).split('.').join("")}`}}					
					onClick={() => {this.setState({isOpen: !this.state.isOpen});}}	
				>
					Hamburgefonstiv 123
				</p>
				<div
						className={`provider provider-${this.props.template.provider}`}
				/>
				<div className={`library-item-actions ${this.state.isOpen ? 'opened' : ''}`}>
					<div className="library-item-action">
						Edit
					</div>
					<div className="library-item-action" onClick={() => {this.props.export(this.props.template.name, 'regular', this.props.values, this.props.template.templateName, this.props.glyphs)}}>
						Download
					</div>
				</div>
				
			</div>
		)
	}
}

export class FamilyItem extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isOpen: false,
		}
	}

	render() {
		return (
			<div className="library-item" tabIndex={0} onBlur={() => {this.setState({isOpen: false})}}>
				<p className="library-item-name">
					{this.props.family.name} from {this.props.template.name}
				</p>
				<p
					className="library-item-preview" 
					style={{fontFamily: `user${this.props.family.id}`}}
					onClick={() => {this.setState({isOpen: !this.state.isOpen});}}
				>
					Hamburgefonstiv 123
				</p>
				<div
						className={`provider provider-custom`}
						style={{backgroundColor: this.props.background}}
				>
					{this.props.user.firstName && this.props.user.firstName.charAt(0)}{this.props.user.lastName && this.props.user.lastName.charAt(0)}
				</div>
				
				<div className={`library-item-actions ${this.state.isOpen ? 'opened' : ''}`}>
					<div className="library-item-action" onClick={() => {this.props.open(this.props.variantToLoad, this.props.family)}}>
						Edit
					</div>
					<div className="library-item-action">
						Download
					</div>
					<div className="library-item-action" onMouseDown={() => {this.props.history.push(`/library/project/${this.props.family.id}`)}}>
						Open family
					</div>
				</div>
			</div>
		)
	}
}

export class PresetItem extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isOpen: false,
		}
		console.log(props)
	}

	render() {
		return (			
			<div className="library-item" tabIndex={0} onBlur={() => {this.setState({isOpen: false})}}>
				<p className="library-item-name">
				{this.props.name} from {this.props.template.name}
				</p>
				<p
					className="library-item-preview"
					style={{fontFamily: `preset${this.props.preset.id}`}}					
					onClick={() => {this.setState({isOpen: !this.state.isOpen});}}
				>
					Hamburgefonstiv 123
				</p>
				<div
						className={`provider provider-custom`}
						style={{backgroundColor: this.props.background}}
				>
					{this.props.user}
				</div>
				<div className={`library-item-actions ${this.state.isOpen ? 'opened' : ''}`}>
					<div className="library-item-action">
						Edit
					</div>
					<div className="library-item-action" onClick={() => {this.props.export(this.props.name, 'regular', this.props.values, this.props.template.templateName, this.props.glyphs)}}>
						Download
					</div>
				</div>
			</div>
		)
	}
}





