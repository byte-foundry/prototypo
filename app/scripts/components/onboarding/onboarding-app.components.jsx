import React from 'react';
import {graphql, gql, compose} from 'react-apollo';
import Lifespan from 'lifespan';

import {Tooltip} from 'react-tippy';
import 'react-tippy/dist/tippy.css';

import onboardingData from '../../data/onboarding.data';
import LocalClient from '../../stores/local-client.stores';

import Button from '../shared/new-button.components';
import Step from './step.components';
import FontUpdater from '../font-updater.components';
import AlternateChoice from './alternate-choice.components';

const flatten = list =>
	list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);

class OnboardingApp extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			step: 0,
			values: undefined,
			parameters: [],
			selectedTemplate: props.location.state.template,
			selectedValues: props.location.state.values,
			familyName: '',
			createdFamily: false,
			creatingFamily: false,
			familyNameError: '',
		};
		this.renderAlternates = this.renderAlternates.bind(this);
		this.getNextStep = this.getNextStep.bind(this);
		this.getPreviousStep = this.getPreviousStep.bind(this);
		this.changeParam = this.changeParam.bind(this);
		this.createProject = this.createProject.bind(this);
	}

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();

		this.client
			.getStore('/undoableStore', this.lifespan)
			.onUpdate((head) => {
				const headJS = head.toJS().d;

				this.setState({
					values: headJS.controlsValues,
				});
			})
			.onDelete(() => {
				this.setState({values: undefined});
			});

		this.client
			.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				const headJS = head.toJS().d;

				this.setState({
					fontName: headJS.fontName,
					parameters: flatten(
						(headJS.fontParameters || []).reduce(
							(a, b) => [a, ...b.parameters],
							[],
						),
					),
					glyphs: headJS.glyphs,
					family: headJS.family,
				});
			})
			.onDelete(() => {
				this.setState({parameters: []});
			});
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.state.fontName !== prevState.fontName) {
			this.getAlternateFonts();
		}
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	getNextStep() {
		if (this.state.step + 1 < onboardingData.steps.length) {
			this.setState({step: this.state.step + 1});
		}
	}

	getPreviousStep() {
		if (this.state.step - 1 >= 0) {
			this.setState({step: this.state.step - 1});
		}
	}

	async createProject() {
		this.setState({familyNameError: ''});
		const name = this.state.familyName;

		if (!String(name).trim()) {
			this.setState({error: 'You must choose a name for your family'});
			return;
		}

		try {
			this.setState({creatingFamily: true});
			const {data: {createFamily: newFont}} = await this.props.createFamily(
				name,
				this.state.selectedTemplate,
				this.state.selectedValues,
			);

			this.setState({creatingFamily: false});
			this.setState({createFamily: true});
			this.client.dispatchAction('/family-created', newFont);

			this.client.dispatchAction('/change-font', {
				templateToLoad: newFont.template,
				variant: newFont.variants[0],
				family: newFont,
			});
			this.getNextStep();
		}
		catch (err) {
			this.setState({creatingFamily: false});
			this.setState({familyNameError: err.message});
		}
	}

	getAlternateFonts() {
		const alternatesUnicodes = Object.keys(this.state.glyphs).filter(
			key =>
				this.state.glyphs[key].length > 1
				&& !this.state.glyphs[key][0].base
				&& key !== 'undefined',
		);
		const alternatesDedup = alternatesUnicodes.reduce((acc, key) => {
			acc[key] = this.state.glyphs[key];
			return acc;
		}, {});

		this.setState({alternatesDedup});
	}

	changeParam(params) {
		this.client.dispatchAction('/change-param', params);
	}

	renderAlternates(stepData) {
		const {alternatesDedup, values} = this.state;

		if (Object.entries(alternatesDedup).length === 0) {
			this.setState({step: this.state.step + 1});
			return;
		}
		const glyphsWithAlternate = Object.entries(alternatesDedup).map(
			([unicode, alternates], index) => {
				const selectedAlternateName
					= (values.altList || {})[unicode] || alternates[0].name;

				return alternates.map((alternate, alternateIndex) => ({
					name:
						alternateIndex === 0
							? 'alternateBase'
							: `alternateFont${index}-${alternateIndex}`,
					subset: stepData.letters[unicode],
					unicode,
					isSelected: selectedAlternateName === alternate.name,
				}));
			},
		);

		return (
			<Step className="step-alternates" {...stepData}>
				{glyphsWithAlternate.map((alternates) => {
					const {unicode} = alternates[0];

					return (
						<AlternateChoice
							alternates={alternates}
							key={unicode}
							text={stepData.letters[unicode]}
							unicode={unicode}
							onSelect={(alternateIndex) => {
								this.client.dispatchAction('/set-alternate', {
									unicode,
									glyphName: alternatesDedup[unicode][alternateIndex].name,
									relatedGlyphs:
										alternatesDedup[unicode][alternateIndex].relatedGlyphs,
								});
							}}
						/>
					);
				})}
			</Step>
		);
	}

	defineRender(stepData) {
		switch (stepData.type) {
		case 'sliders':
			return (
				<Step
					className="step-sliders-wrapper"
					{...stepData}
					parameters={this.state.parameters}
					fontName={this.state.fontName}
					values={this.state.values}
					onChangeParam={this.changeParam}
				/>
			);
		case 'alternates':
			return this.renderAlternates(stepData);
		case 'serifs':
			return (
				<Step
					className="step-serifs-wrapper"
					{...stepData}
					parameters={this.state.parameters}
					fontName={this.state.fontName}
					values={this.state.values}
					onChangeParam={this.changeParam}
				/>
			);
		case 'finish':
			return (
				<Step
					className="step-finish"
					{...stepData}
					fontName={this.state.fontName}
				/>
			);
		case 'start':
			return <Step className="step-start" {...stepData} />;
		default:
			return null;
		}
	}

	async deleteFamily(family) {
		try {
			await this.props.deleteFamily(family);
			// legacy call use to change the selected family
			this.client.dispatchAction('/delete-family', {
				family,
			});
			await this.props.refetch();
			this.props.router.push('/library/create');
		}
		catch (err) {
			// TODO: Error handling
			this.props.router.push('/library/create');
			console.log(err);
		}
	}

	render() {
		const {
			step,
			alternatesDedup,
			values,
			selectedTemplate,
			fontName,
			createFamily,
		} = this.state;
		const stepData = onboardingData.steps[step];

		// Failsafe

		// Just getting the fonts we need to generate
		let fontsToGenerate = [];

		if (stepData.type === 'alternates') {
			fontsToGenerate = Object.keys(alternatesDedup || []).reduce(
				(arr, glyphUnicode, index) => {
					const alternatesToGenerate = alternatesDedup[glyphUnicode]
						.map((alternate, alternateIndex) => {
							// we won't generate a specific variant for the default glyph
							if (alternateIndex === 0) {
								return null;
							}

							return {
								name: `alternateFont${index}-${alternateIndex}`,
								subset: stepData.letters[glyphUnicode],
								values: {
									...this.state.values,
									altList: {
										[glyphUnicode]: alternate.name,
									},
								},
								unicode: alternate.unicode,
								isSelected: alternateIndex === 0,
							};
						})
						.filter(a => a); // filtering null values

					return arr.concat(alternatesToGenerate);
				},
				[],
			);
		}

		const {letters} = onboardingData.steps.find(e => e.type === 'alternates');
		const allStrings = Object.values(letters).join('');

		const updaters = fontsToGenerate.map(font => (
			<FontUpdater
				key={font.name}
				name={font.name}
				subset={font.subset}
				values={font.values}
				template={this.state.selectedTemplate}
				glyph="0"
			/>
		));

		if (values && selectedTemplate && fontName && createFamily) {
			updaters.push(
				<FontUpdater
					name="alternateBase"
					subset={allStrings}
					values={{
						...values,
						altList: {},
					}}
					template={selectedTemplate}
					glyph="0"
				/>,
			);

			updaters.push(
				<FontUpdater
					name={fontName}
					subset="Hamburgefonstiv"
					values={{
						...values,
						altList: {},
					}}
					template={selectedTemplate}
					glyph="0"
				/>,
			);
		}

		return (
			<div className="onboarding-app">
				<div className="onboarding-wrapper">
					<Button
						outline
						neutral
						size="small"
						className="backToApp"
						onClick={() => {
							this.deleteFamily(this.state.family);
						}}
					>
						Back to library
					</Button>
					{this.props.families
						&& this.props.families.length > 3
						&& stepData.type !== 'start' && (
						<Button
							outline
							neutral
							size="small"
							className="skip"
							onClick={() => this.props.router.push('/dashboard')}
						>
								Skip
						</Button>
					)}
					<div className="onboarding-content">
						{this.defineRender(stepData)}
						{stepData.type === 'start' && (
							<div className="step step-start-second">
								<p className="description">
									But first, let's give your project a name.
								</p>
								<input
									type="text"
									name="familyName"
									id="familyName-Input"
									value={this.state.familyName}
									onChange={(e) => {
										this.setState({
											familyName: e.target.value,
										});
									}}
								/>
								{this.state.familyNameError !== '' && (
									<p className="description error">
										{this.state.familyNameError}
									</p>
								)}
								<Button
									className="create"
									onClick={() => {
										this.createProject();
									}}
								>
									Start designing
								</Button>
								<h3>Need inspiration?</h3>
								<p className="description">
									A good name for a typeface should reflect its design and its
									purpose. <br />
									You can use{' '}
									<a
										href="http://namecheck.fontdata.com/about/"
										target="_blank"
										rel="noopener noreferrer"
									>
										http://namecheck.fontdata.com/about/
									</a>{' '}
									to check the availibility of the chosen name.
								</p>
							</div>
						)}
						{stepData.type !== 'start' && (
							<Button
								className="nextStep"
								loading={this.state.parameters === []}
								onClick={() => {
									if (this.state.parameters !== []) {
										this.state.step < onboardingData.steps.length - 1
											? this.getNextStep()
											: this.props.router.push('/dashboard');
									}
								}}
							>
								{(() => {
									switch (this.state.step) {
									case 0:
										return 'Start';
										break;
									case onboardingData.steps.length - 1:
										return 'Finish';
										break;
									default:
										return 'Next';
										finish;
									}
								})()}
							</Button>
						)}
						{updaters}
						{stepData.type !== 'start' && (
							<div className="bubbles">
								{onboardingData.steps.map((step, index) => (
									<Tooltip
										title={step.name}
										position="bottom"
										trigger="mouseenter"
										delay="500"
										arrow="true"
									>
										<div
											className={`bubble ${
												index === this.state.step ? 'active' : ''
											} ${index < this.state.step ? 'previous' : ''}`}
											onClick={() => {
												index <= this.state.step
													? this.setState({
														step: index,
													})
													: false;
											}}
										/>
									</Tooltip>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}
}

export const libraryQuery = gql`
	query {
		user {
			id
			library {
				id
				name
				template
				tags
				designer
				designerUrl
				foundry
				foundryUrl
				variants {
					id
					name
					values
					width
					weight
					italic
				}
			}
		}
	}
`;

const deleteVariantMutation = gql`
	mutation deleteVariant($id: ID!) {
		deleteVariant(id: $id) {
			id
		}
	}
`;

const deleteFamilyMutation = gql`
	mutation deleteFamily($id: ID!) {
		deleteFamily(id: $id) {
			id
		}
	}
`;

const getUserIdQuery = gql`
	query getUserId {
		user {
			id
		}
	}
`;

const createFamilyMutation = gql`
	mutation createFamily(
		$name: String!
		$template: String!
		$values: Json
		$ownerId: ID!
	) {
		createFamily(
			name: $name
			template: $template
			ownerId: $ownerId
			designer: ""
			designerUrl: ""
			foundry: "Prototypo"
			foundryUrl: "https://prototypo.io/"
			variants: [
				{
					name: "Regular"
					values: $values
					weight: 400
					width: "normal"
					italic: false
				}
			]
		) {
			id
			name
			template
			tags
			id
			name
			template
			designer
			designerUrl
			foundry
			foundryUrl
			variants {
				id
				name
				values
				weight
				width
				italic
			}
		}
	}
`;

export default compose(
	graphql(libraryQuery, {
		options: {
			fetchPolicy: 'network-only',
		},
		props: ({data}) => {
			if (data.loading) {
				return {loading: true};
			}

			if (data.user) {
				return {
					families: data.user.library,
					refetch: data.refetch,
				};
			}

			return {refetch: data.refetch};
		},
	}),
	graphql(deleteVariantMutation, {
		props: ({mutate}) => ({
			deleteVariant: id =>
				mutate({
					variables: {id},
				}),
		}),
		options: {
			update: (store, {data: {deleteVariant}}) => {
				const data = store.readQuery({query: libraryQuery});

				data.user.library.forEach((family) => {
					// eslint-disable-next-line
					family.variants = family.variants.filter(
						variant => variant.id !== deleteVariant.id,
					);
				});

				store.writeQuery({
					query: libraryQuery,
					data,
				});
			},
		},
	}),
	graphql(deleteFamilyMutation, {
		props: ({mutate, ownProps}) => ({
			deleteFamily: (family) => {
				if (!family) {
					return Promise.reject();
				}

				// don't worry, mutations are batched, so we're only sending one or two requests
				// in the future, cascade operations should be available on graphcool
				const variants = family.variants.map(variant =>
					ownProps.deleteVariant(variant.id),
				);

				return Promise.all([...variants, mutate({variables: {id: family.id}})]);
			},
		}),
		options: {
			update: (store, {data: {deleteFamily}}) => {
				const data = store.readQuery({query: libraryQuery});

				data.user.library = data.user.library.filter(
					font => font.id !== deleteFamily.id,
				);

				store.writeQuery({
					query: libraryQuery,
					data,
				});
			},
		},
	}),
	graphql(getUserIdQuery, {
		props: ({data}) => {
			if (data.loading) {
				return {loading: true};
			}

			return {userId: data.user.id};
		},
	}),
	graphql(createFamilyMutation, {
		props: ({mutate, ownProps}) => ({
			createFamily: (name, template, values) =>
				mutate({
					variables: {
						ownerId: ownProps.userId,
						name,
						template,
						values: JSON.stringify(values),
					},
				}),
		}),
		options: {
			update: (store, {data: {createFamily}}) => {
				const data = store.readQuery({query: libraryQuery});

				data.user.library.push(createFamily);

				store.writeQuery({
					query: libraryQuery,
					data,
				});
			},
		},
	}),
)(OnboardingApp);
