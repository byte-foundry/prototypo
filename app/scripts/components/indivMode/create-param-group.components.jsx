import React from 'react';
import Lifespan from 'lifespan';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import LocalClient from '../../stores/local-client.stores.jsx';

import InputWithLabel from '../shared/input-with-label.components.jsx';
import Button from '../shared/button.components.jsx';
import CloseButton from '../close-button.components.jsx';
import GlyphGrid from '../glyph-grid.components.jsx';

export default class CreateParamGroup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: [],
			groups: [],
		};

		//We bind member methods in the constructor to avoid
		//triggering render on children pure render component
		this.close = this.close.bind(this);
		this.createGroup = this.createGroup.bind(this);
		this.selectGlyph = this.selectGlyph.bind(this);
		this.prepareDeleteOrDelete = this.prepareDeleteOrDelete.bind(this);
		this.cancelDelete = this.cancelDelete.bind(this);
		this.openGroup = this.openGroup.bind(this);

		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					tags: head.toJS().tags,
					selected: head.toJS().indivSelected,
					tagSelected: head.toJS().indivTagSelected,
					errorMessage: head.toJS().indivErrorMessage,
					errorGlyphs: head.toJS().indivErrorGlyphs,
					groups: head.toJS().indivGroups,
					forbiddenGlyphs: head.toJS().indivOtherGroups,
					glyphGroupDeleteSplit: head.toJS().uiGlyphGroupDeleteSplit,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	createGroup(e) {
		e.preventDefault();

		if (this.props.editMode) {
			this.client.dispatchAction('/save-param-group', {
				newName: this.refs.groupname.inputValue,
			});
		}
		else {
			this.client.dispatchAction('/create-param-group', {
				name: this.refs.groupname.inputValue,
				selected: this.state.selected,
			});
		}
	}

	close(e) {
		e.preventDefault();
		this.client.dispatchAction('/store-value', {
			indivCreate: false,
			indivEdit: false,
			indivCurrentGroup: undefined,
			indivSelected: [],
			indivErrorMessage: [],
			indivErrorGlyphs: [],
		});
	}

	openGroup() {
		this.client.dispatchAction('/store-value', {
			indivEdit: false,
			indivEditingParams: true,
		});
	}

	selectGlyph(unicode, isSelected) {
		if (this.props.editMode) {
			this.client.dispatchAction('/add-glyph-to-indiv-edit', {unicode, isSelected});
		}
		else {
			this.client.dispatchAction('/add-glyph-to-indiv-create', {unicode, isSelected});
		}
	}

	prepareDeleteOrDelete() {
		if (this.state.glyphGroupDeleteSplit) {
			this.client.dispatchAction('/delete-param-group', this.props.group);
			this.client.dispatchAction('/store-value', {
				uiGlyphGroupDeleteSplit: false,
			});
		}
		else {
			this.client.dispatchAction('/store-value', {
				uiGlyphGroupDeleteSplit: true,
			});
		}
	}

	cancelDelete() {
		this.client.dispatchAction('/store-value', {
			uiGlyphGroupDeleteSplit: false,
		});
	}

	render() {

		const error = this.state.errorMessage ? (
			<div className="add-family-form-error">
				{this.state.errorMessage}
			</div>
		) : false;

		const glyphs = _.map(this.state.selected, (glyph) => {
			return <div key={glyph} onClick={() => { this.removeGlyph(glyph);}} className="delete-param-group-glyph">{String.fromCharCode(glyph)}</div>;
		});

		const buttons = this.props.editMode
			? [
				<Button key="open" label="Open in prototypo" neutral={true} click={this.openGroup}/>,
				<Button key="save" label="Save change" neutral={true} click={this.createGroup}/>,
				<Button
					key="delete"
					label={this.state.glyphGroupDeleteSplit ? 'Delete' : 'Delete group'}
					altLabel="Cancel"
					danger={true}
					splitButton={true}
					splitted={this.state.glyphGroupDeleteSplit}
					click={this.prepareDeleteOrDelete}
					altClick={this.cancelDelete}
				/>,
			]
			: <Button label="Save change" neutral={true} click={this.createGroup}/>;

		return (
			<div className="create-param-group">
				<form className="create-param-group-form" onSubmit={this.createGroup}>
					<div className="create-param-group-form-close">
						<CloseButton click={this.close}/>
					</div>
					<InputWithLabel ref="groupname" label="Group name" inputValue={this.props.group ? this.props.group.name : ''}/>
					<GlyphGrid
						forbidden={this.state.forbiddenGlyphs}
						select={this.selectGlyph}
						tagSelected={this.state.tagSelected}
						selected={this.props.group ? this.props.group.glyphs : this.state.selected}
						tags={this.state.tags}/>
					{error}
					{buttons}
				</form>
			</div>
		);
	}
}
