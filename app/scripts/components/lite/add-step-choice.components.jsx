import React from 'react';
import Classnames from 'classnames';
import Lifespan from 'lifespan';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ScrollArea from 'react-scrollbar';
import {hashHistory} from 'react-router';
import LocalClient from '~/stores/local-client.stores.jsx';
import Log from '~/services/log.services.js';

import Button from '../shared/button.components.jsx';

export class AddStep extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
		this.client.getStore('/prototypoStore', this.lifespan)
		.onUpdate((head) => {
				this.setState({
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

	createStep(e) {
		e.stopPropagation();
		e.preventDefault();
		if (this.props.edit) {
			this.client.dispatchAction('/edit-step', {
				baseName: this.state.step.name,
				name: this.refs.name.value,
				description: this.refs.description.value,
			});
		}
		else {
			this.client.dispatchAction('/create-step', {
				name: this.refs.name.value,
				description: this.refs.description.value,
				choice: this.refs.choice.value,
			});
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

	createChoice(e) {
		e.stopPropagation();
		e.preventDefault();
		if (this.props.edit) {
			this.client.dispatchAction('/edit-choice', {
				baseName: this.state.choice.name,
				name: this.refs.name.value,
				stepName: this.props.step.name,
			});
		}
		else {
			this.client.dispatchAction('/create-choice', {
				name: this.refs.name.value,
				stepName: this.props.step.name,
			});
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
					variant: head.toJS().d.variant,
				});
				console.log(head.toJS().d.variant);
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
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
		if (this.state.variant) {
			data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state.variant.ptypoLite));
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
					</div>
				</div>
			</div>
		);
	}
}
