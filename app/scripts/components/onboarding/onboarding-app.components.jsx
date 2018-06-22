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
		console.log(props)
		super(props);
		this.state = {
			step: 0,
			values: undefined,
			parameters: [],
		};
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
						headJS.fontParameters.reduce((a, b) => [a, ...b.parameters]),
					),
					onboardingFrom: headJS.onboardingFrom,
					glyphs: headJS.glyphs,
					family: headJS.family,
				});
			})
			.onDelete(() => {
				this.setState({parameters: []});
			});

		this.renderAlternates = this.renderAlternates.bind(this);
		this.getNextStep = this.getNextStep.bind(this);
		this.getPreviousStep = this.getPreviousStep.bind(this);
		this.changeParam = this.changeParam.bind(this);
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
			switch (this.state.onboardingFrom) {
			case 'library':
				this.client.dispatchAction('/store-value', {
					uiShowCollection: true,
				});
				this.client.dispatchAction('/store-value', {
					onboardingFrom: undefined,
				});
				this.props.router.push('/dashboard');
				break;
			case 'start':
				this.client.dispatchAction('/store-value', {
					onboardingFrom: undefined,
				});
				this.props.router.push('/start');
				break;
			default:
				break;
			}
		}
		catch (err) {
			// TODO: Error handling
			this.props.router.push('/start');
			console.log(err);
		}
	}

	render() {
		const {step, alternatesDedup, values} = this.state;
		const stepData = onboardingData.steps[step];

		// Failsafe
		if (this.state.fontName && !this.state.onboardingFrom) {
			return (
				<div className="onboarding-app">
					<div className="onboarding-wrapper">
						this.props.router.push("/dashboard");
						<Button
							outline
							neutral
							size="small"
							className="backToApp"
							onClick={() => this.props.router.push('/dashboard')}
						>
							Return to dashboard
						</Button>
						<div className="onboarding-content" />
					</div>
				</div>
			);
		}

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
						&& this.props.families.length > 3 && (
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
						<Button
							className="nextStep"
							onClick={() => {
								this.state.step < onboardingData.steps.length - 1
									? this.getNextStep()
									: this.props.router.push('/dashboard');
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
						<FontUpdater
							extraFonts={[
								...fontsToGenerate,
								{
									// base font without any alternates
									name: 'alternateBase',
									subset: allStrings,
									values: {
										...values,
										altList: {},
									},
								},
							]}
						/>
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
													? this.setState({step: index})
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
				variants {
					id
					name
					values
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
)(OnboardingApp);
