import React from 'react';
import Classnames from 'classnames';
import Lifespan from 'lifespan';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {compose, graphql, gql} from 'react-apollo';
import LocalClient from '~/stores/local-client.stores.jsx';
import Button from '../shared/button.components.jsx';
import {libraryQuery} from '../collection/collection.components';
import { request } from 'graphql-request';

const getVariantQuery = gql`
query getVariantQuery($variantId: ID!) {
	variant: Variant(id: $variantId) {
		id
		name
		values
		family {
		  owner {
			  id
		  }
		  name
		  template
		}
	}
}
`;

const createPresetWithValuesMutation = gql`
mutation createPresetWithValues($stepName: String!, $stepDescription: String!, $choiceName: String!, $template: String!, $variantId: ID!, $baseValues: Json! ) {
	createPreset(
		template: $template
		needs: ["logo"]
		baseValues: $baseValues
		steps: [{
		  name: $stepName
		  description: $stepDescription
		  choices: [{
			name: $choiceName
		  }]
		}]
		variantId: $variantId
	) {
		id
		steps {
			id
			name
			description
			choices {
				id
				name
			}
		}
	}
}
`;

const createStepMutation = gql`
mutation createStep($name: String!, $description: String!, $presetId: ID!, $choiceName: String! ) {
	createStep(
		name: $name
		description: $description
		presetId: $presetId
		choices:[{name: $choiceName}]
	) {
		id
		name
		description
		choices {
			id
			name
		}
	}
}
`;

const createChoiceMutation = gql`
mutation createChoice($name: String!, $stepId: ID! ) {
	createChoice(
		name: $name
		stepId: $stepId
	) {
		id
		name
	}
}
`;

const renameStepMutation = gql`
mutation renameStep($id: ID!, $newName: String!, $newDescription: String!) {
	updateStep(id: $id, name: $newName, description: $newDescription) {
		id
		name
		description
	}
}
`;


const renameChoiceMutation = gql`
mutation renameChoice($id: ID!, $newName: String!) {
	updateChoice(id: $id, name: $newName) {
		id
		name
	}
}
`;

export class AddStep extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
		this.createStep = this.createStep.bind(this);
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
		this.client.getStore('/prototypoStore', this.lifespan)
		.onUpdate((head) => {
				this.setState({
					preset: head.toJS().d.preset,
					error: head.toJS().d.errorAddStep,
					step: head.toJS().d.step.name ? head.toJS().d.step : head.toJS().d.variant.ptypoLite.steps[0],
				});
			})
			.onDelete(() => {
				this.setState({
					error: undefined,
				});
			});
	}

	componentWillUnmount() {
		this.client.dispatchAction('/store-value', {
			errorAddStep: undefined,
		});

		this.lifespan.release();
	}

	exit() {
		this.client.dispatchAction('/store-value', {
			openStepModal: false,
			stepModalEdit: false,
			errorAddStep: undefined,
		});
	}

	async createStep(e) {
		e.stopPropagation();
		e.preventDefault();

		const name = this.refs.name.value;
		const description = this.refs.description.value;
		const choice = this.props.edit ? '' : this.refs.choice.value;


		if (!String(name).trim()) {
			this.setState({error: 'You must choose a name for your step.'});
			return;
		}

		if (!String(description).trim()) {
			this.setState({error: 'You must choose a name for your step description.'});
			return;
		}

		if (!String(choice).trim() && !this.props.edit) {
			this.setState({error: 'You must choose a name for your first choice.'});
			return;
		}

		if (this.props.edit) {
			console.log('====================================');
			const {data: {updateStep: newStep}} = await this.props.renameStep(
				name,
				description,
			);
			this.client.dispatchAction('/edit-step', newStep);
		}
		else {
			try {
				if (this.state.preset) {
					const {data: {createStep: newStep}} = await this.props.createStep(
						name,
						description,
						this.props.preset.id,
						choice,
					);
					this.client.dispatchAction('/created-step', newStep);
				}
				else {
					const {data: {createPreset: newPreset}} = await this.props.createPresetWithValues(
						name,
						description,
						choice,
					);
					this.client.dispatchAction('/created-preset', {...newPreset, baseValues: this.props.variant.values});
				}

				// this.client.dispatchAction('/change-font', {
				// 	templateToLoad: newFont.template,
				// 	variantId: newFont.variants[0].id,
				// });

				// Log.ui(`createFamily.${selectedFont.templateName}`);
				// this.client.dispatchAction('/store-value', {uiOnboardstep: 'customize'});

				// this.props.onCreateFamily(newFont);
			}
			catch (err) {
				this.setState({error: err.message});
			}
		}
	}

	render() {
		const stepClass = Classnames({
			'add-family': true,
			'with-error': !!this.state.error,
		});
		const error = this.state.error ? <div className="add-family-form-error">{this.state.error}</div> : false;
		const nameInput = (this.props.edit && this.state.step)
			? (
				<input ref="name" key={this.state.step.name} className="add-family-form-input" type="text" placeholder="Step 1" defaultValue={this.state.step.name}/>
			)
			: (
				<input ref="name" className="add-family-form-input" type="text" placeholder="Step 1" />
			);
		const descriptionInput = (this.props.edit && this.state.step)
			? (
				<input ref="description" key={this.state.step.description} className="add-family-form-input" type="text" placeholder="Step description" defaultValue={this.state.step.description}/>
			)
			: (
				<input ref="description" className="add-family-form-input" type="text" placeholder="Step description"/>
			);
		return (
			<div className={stepClass} id="step-create">
				<div className="add-family-form">
					<form onSubmit={(e) => {this.createStep(e);} }>
						<label className="add-family-form-label">Step name</label>
						{nameInput}
						<label className="add-family-form-label">Step description</label>
						{descriptionInput}
						{this.props.edit ? false : (
							<span>
								<label className="add-family-form-label">Name of your first choice</label>
								<input ref="choice" className="add-family-form-input" type="text" placeholder="Choice name"/>
							</span>
						)}
					</form>
					{error}
					<div className="action-form-buttons">
						<Button click={(e) => {this.exit(e);} } label="Cancel" neutral={true}/>
						<Button click={(e) => {this.createStep(e);} } label={this.props.edit ? 'Edit step' : 'Create step'} />
					</div>
				</div>
			</div>
		);
	}
}

AddStep = compose(
	graphql(getVariantQuery, {
		options: ({variant}) => ({variables: {variantId: variant.id}}),
		props({data}) {
			if (data.loading) {
				return {loading: true};
			}

			return {
				userId: data.variant.family.owner.id,
				variant: {
					id: data.variant.id,
					name: data.variant.name,
					values: data.variant.values,
					family: data.variant.family.name,
					template: data.variant.family.template,
				},
			};
		},
	}),
	graphql(createStepMutation, {
		props: ({mutate}) => ({
			createStep: (name, description, presetId, choiceName) => {
				return mutate({
					variables: {
						presetId,
						name,
						description,
						choiceName,
					},
				});
			},
		}),
	}),
	graphql(createPresetWithValuesMutation, {
		props: ({mutate, ownProps}) => ({
			createPresetWithValues: (name, description, choiceName) => {
				return mutate({
					variables: {
						stepName: name,
						stepDescription: description,
						choiceName,
						template: ownProps.variant.template,
						variantId: ownProps.variant.id,
						baseValues: JSON.parse(JSON.stringify(ownProps.variant.values)),
					},
				});
			},
		}),
	}),
	graphql(renameStepMutation, {
		props: ({mutate, ownProps}) => ({
			renameStep: (newName, newDescription) =>
				mutate({
					variables: {
						id: ownProps.step.id,
						newName,
						newDescription,
					},
				}),
		}),
	})
) (AddStep);

export class AddChoice extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: undefined,
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					error: head.toJS().d.errorAddChoice,
					choice: head.toJS().d.choice.name ? head.toJS().d.choice : head.toJS().d.variant.ptypoLite.steps[0].choices[0],
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	async createChoice(e) {
		e.stopPropagation();
		e.preventDefault();

		const name = this.refs.name.value;


		if (!String(name).trim()) {
			this.setState({error: 'You must choose a name for your choice.'});
			return;
		}

		if (this.props.edit) {
			const {data: {updateChoice: newChoice}} = await this.props.renameChoice(
				name,
			);
			this.client.dispatchAction('/edit-choice', newChoice);
		}
		else {
			try {
				const {data: {createChoice: newChoice}} = await this.props.createChoice(
					name,
					this.props.step.id,
				);
				this.client.dispatchAction('/created-choice', newChoice);
			}
			catch (err) {
				this.setState({error: err.message});
			}
		}
	}

	exit() {
		this.client.dispatchAction('/store-value', {
			openChoiceModal: false,
			choiceModalEdit: false,
			errorAddChoice: undefined,
		});
	}

	render() {
		const choiceClass = Classnames({
			'add-family': true,
			'with-error': !!this.state.error,
		});
		const error = this.state.error ? <div className="add-family-form-error">{this.state.error}</div> : false;
		const nameInput = (this.props.edit && this.state.choice)
			? (
				<input ref="name" key={this.state.choice.name} className="add-family-form-input" type="text" placeholder="Choice 1" defaultValue={this.state.choice.name}/>
			)
			: (
				<input ref="name" className="add-family-form-input" type="text" placeholder="Choice 1"/>
			);

		return (
			<div className={choiceClass} id="step-create">
				<div className="add-family-form">
					<label className="add-family-form-label">Choose a choice name</label>
					<form onSubmit={(e) => {this.createChoice(e);} }>
					{nameInput}
					</form>
					{error}
					<div className="action-form-buttons">
						<Button click={(e) => {this.exit(e);} } label="Cancel" neutral={true}/>
						<Button click={(e) => {this.createChoice(e);} } label={this.props.edit ? 'Edit choice' : 'Create choice'}/>
					</div>
				</div>
			</div>
		);
	}
}


AddChoice = compose(
	graphql(createChoiceMutation, {
		props: ({mutate, ownProps}) => ({
			createChoice: (name) => {
				return mutate({
					variables: {
						stepId: ownProps.step.id,
						name,
					},
				});
			},
		}),
		options: {
			update: (store, {data: {createChoice}}) => {
				const data = store.readQuery({query: libraryQuery});
				store.writeQuery({
					query: libraryQuery,
					data,
				});
			},
		},
	}),
	graphql(renameChoiceMutation, {
		props: ({mutate, ownProps}) => ({
			renameChoice: newName =>
				mutate({
					variables: {
						id: ownProps.choice.id,
						newName,
					},
				}),
		}),
	})
) (AddChoice);


export class ExportLite extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					preset: head.toJS().d.preset,
					variant: head.toJS().d.variant,
					family: head.toJS().d.family,
				});
				console.log(head.toJS().d.preset);
				console.log(head.toJS().d.variant);
				console.log(head.toJS().d.family);
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	sendToLite() {

		const template = this.state.family.template;
		const variant = this.state.variant.name || 'regular';
		const familyName = this.state.family.name;

		// import { request } from 'graphql-request'

		// const query = `query getMovie($title: String!) {
		//   Movie(title: $title) {
		// 	releaseDate
		// 	actors {
		// 	  name
		// 	}
		//   }
		// }`

		// const variables = {
		//   title: 'Inception',
		// }

		// request('my-endpoint', query, variables).then(data => console.log(data))

		const createNewPreset = (type, id) => `
			mutation {
				${type} (id: "${id}") {
					selected
				}
			}
		`;
		const GRAPHQL_API = 'https://api.graph.cool/simple/v1/cj6maa0ib2tud01656t4tp4ej';

		request(GRAPHQL_API, getSelectedCount('Step', font.steps[0].id))
			.then(
				this.client.dispatchAction('/store-value', {
					openExportLiteModal: false,
				}),
			)
			.catch(error => console.log(error));
	}

	exit() {
		this.client.dispatchAction('/store-value', {
			openExportLiteModal: false,
		});
	}

	render() {
		const choiceClass = Classnames({
			'add-family': true,
		});
		let data;
		if (this.state.preset) {
			data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state.preset));
		}
		const download = this.state.variant && (
			<a href={`data:${data}`} download={`${this.state.variant.db}.json`}>Download JSON</a>
		);

		return (
			<div className={choiceClass} id="step-create">
				<div className="add-family-form">
					{download}
					<div className="action-form-buttons">
						<Button click={(e) => {this.exit(e);} } label="Cancel" neutral={true}/>
						<Button click={(e) => {this.sendToLite();} } label="Send to Unique staging"/>
					</div>
				</div>
			</div>
		);
	}
}
