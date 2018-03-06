import React from "react";
import _uniq from "lodash/uniq";
import { graphql, gql, compose } from "react-apollo";
import Button from "../shared/new-button.components";
import { browserHistory } from "react-router";
import OnboardingSlider from "./onboarding-slider.components";
import onboardingData from "../../data/onboarding.data";
import Lifespan from "lifespan";
import LocalClient from "../../stores/local-client.stores";
import FontUpdater from "../font-updater.components";

const flatten = list =>
	list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
class OnboardingApp extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			step: 0,
			values: undefined,
			parameters: []
		};
	}
	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();

		this.client
			.getStore("/undoableStore", this.lifespan)
			.onUpdate(head => {
				const headJS = head.toJS().d;

				this.setState({
					values: headJS.controlsValues
				});
			})
			.onDelete(() => {
				this.setState({ values: undefined });
			});

		this.client
			.getStore("/prototypoStore", this.lifespan)
			.onUpdate(head => {
				const headJS = head.toJS().d;

				this.setState({
					fontName: headJS.fontName,
					parameters: flatten(
						headJS.fontParameters.reduce((a, b) => [
							a,
							...b.parameters
						])
					),
					onboardingFrom: headJS.onboardingFrom,
					glyphs: headJS.glyphs,
					family: headJS.family
				});
				this.getAlternateFonts();
			})
			.onDelete(() => {
				this.setState({ parameters: [] });
			});

		this.getSliderData = this.getSliderData.bind(this);
		this.renderSliders = this.renderSliders.bind(this);
		this.renderSerifs = this.renderSerifs.bind(this);
		this.renderFinish = this.renderFinish.bind(this);
		this.renderAlternates = this.renderAlternates.bind(this);
		this.getNextStep = this.getNextStep.bind(this);
		this.getPreviousStep = this.getPreviousStep.bind(this);
		this.changeParam = this.changeParam.bind(this);
		this.getAlternateFonts = this.getAlternateFonts.bind(this);
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	getSliderData(sliderName) {
		return this.state.parameters.find(e => e.name === sliderName);
	}

	getNextStep() {
		if (this.state.step + 1 < onboardingData.steps.length) {
			this.setState({ step: this.state.step + 1 });
			this.getAlternateFonts();
		}
	}

	getPreviousStep() {
		if (this.state.step - 1 >= 0) {
			this.setState({ step: this.state.step - 1 });
		}
	}

	getAlternateFonts() {
		const stepData = onboardingData.steps.find(
			e => e.type === "alternates"
		);
		// List alternates
		const alternatesDedup = Object.assign(
			...Object.keys(this.state.glyphs)
				.filter(
					key =>
						this.state.glyphs[key].length > 1 &&
						!this.state.glyphs[key][0].base &&
						key !== "undefined"
				)
				.map(key => ({ [key]: this.state.glyphs[key] }))
		);
		const alternateList = Object.keys(alternatesDedup).map(
			(alternateKey, index) => ({
				name: `alternateFont${index}`,
				subset: stepData.letters[alternateKey],
				values: {
					...this.state.values,
					altList: {
						[alternateKey]: alternatesDedup[alternateKey][1].name
					}
				},
				unicode: alternatesDedup[alternateKey][1].unicode,
				isSelected: false
			})
		);
		const allStrings =
			Object.keys(stepData.letters).reduce(
				(previous, key) => previous + stepData.letters[key]
			) + stepData.letters[Object.keys(stepData.letters)[0]];
		this.setState({
			alternateList,
			alternatesDedup,
			baseAlternateFont: {
				name: "alternateBase",
				subset: allStrings,
				values: {
					...this.state.values,
					altList: {}
				}
			}
		});
	}

	changeParam(params) {
		this.client.dispatchAction("/change-param", params);
	}

	renderSliders(stepData) {
		return (
			<div className="step step-sliders-wrapper">
				<h3>{stepData.title}</h3>
				<p className="description">{stepData.description}</p>
				<div
					className="text"
					style={{ fontFamily: this.state.fontName }}
				>
					{this.renderHighlightedText(stepData.letters)}
				</div>
				<div className="step-sliders">
					{stepData.sliders.map(slider => {
						const sliderData = this.getSliderData(slider);
						return (
							sliderData && (
								<OnboardingSlider
									label={sliderData.label}
									min={sliderData.minAdvised}
									max={sliderData.maxAdvised}
									step={sliderData.step}
									value={this.state.values[sliderData.name]}
									onChange={this.changeParam}
									name={sliderData.name}
								/>
							)
						);
					})}
				</div>
			</div>
		);
	}

	renderAlternates(stepData) {
		const { alternateList } = this.state;
		return (
			<div className="step step-alternates">
				<h1>{stepData.title}</h1>
				<p className="description">{stepData.description}</p>
				{alternateList.map((alternate, index) => (
					<div className="alternate-row">
						<div
							className={`alternate-choice ${
								alternate.isSelected ? "" : "selected"
							}`}
							style={{ fontFamily: "alternateBase" }}
							onClick={() => {
								this.client.dispatchAction("/set-alternate", {
									unicode: alternate.unicode,
									glyphName: this.state.alternatesDedup[
										alternate.unicode
									][0].name,
									relatedGlyphs: this.state.alternatesDedup[
										alternate.unicode
									][0].relatedGlyphs
								});
								alternateList[index].isSelected = false;
								this.setState({ alternateList });
							}}
						>
							{this.renderHighlightedText(
								String.fromCharCode(alternate.unicode),
								stepData.letters[alternate.unicode]
							)}
						</div>
						<div
							className={`alternate-choice ${
								alternate.isSelected ? "selected" : ""
							}`}
							style={{ fontFamily: alternate.name }}
							onClick={() => {
								this.client.dispatchAction("/set-alternate", {
									unicode: alternate.unicode,
									glyphName: this.state.alternatesDedup[
										alternate.unicode
									][1].name,
									relatedGlyphs: this.state.alternatesDedup[
										alternate.unicode
									][1].relatedGlyphs
								});
								alternateList[index].isSelected = true;
								this.setState({ alternateList });
							}}
						>
							{this.renderHighlightedText(
								String.fromCharCode(alternate.unicode),
								stepData.letters[alternate.unicode]
							)}
						</div>
					</div>
				))}
			</div>
		);
	}

	renderFinish(stepData) {
		return (
			<div className="step step-finish">
				<h3>{stepData.title}</h3>
				<p className="description">{stepData.description}</p>
			</div>
		);
	}

	renderSerifs(stepData) {
		return (
			<div className="step step-serifs-wrapper">
				<h3>{stepData.title}</h3>
				<p className="description">{stepData.description}</p>
				<p className="text" style={{ fontFamily: this.state.fontName }}>
					{stepData.letters}
				</p>
				<div className="step-sliders">
					{stepData.sliders.map(slider => {
						const sliderData = this.getSliderData(slider);
						return (
							sliderData && (
								<OnboardingSlider
									label={sliderData.label}
									min={sliderData.minAdvised}
									max={sliderData.maxAdvised}
									step={sliderData.step}
									value={this.state.values[sliderData.name]}
									onChange={this.changeParam}
									name={sliderData.name}
								/>
							)
						);
					})}
				</div>
			</div>
		);
	}

	defineRender(stepData) {
		switch (stepData.type) {
			case "sliders":
				return this.renderSliders(stepData);
				break;
			case "alternates":
				return this.renderAlternates(stepData);
				break;
			case "serifs":
				return this.renderSerifs(stepData);
				break;
			case "finish":
				return this.renderFinish(stepData);
				break;
			default:
				return false;
				break;
		}
	}

	renderHighlightedText(letters, alternateText) {
		const charactersArr = alternateText
			? alternateText.split("")
			: "Hamburgefonstiv".split("");

		return (
			<p className="text">
				{charactersArr.map(char => (
					<span
						className={
							letters.indexOf(char) > -1 ? "highlighted" : ""
						}
					>
						{char}
					</span>
				))}
			</p>
		);
	}

	async deleteFamily(family) {
		try {
			await this.props.deleteFamily(family);
			// legacy call use to change the selected family
			this.client.dispatchAction("/delete-family", {
				family
			});
			await this.props.refetch();
			switch (this.state.onboardingFrom) {
				case "library":
					this.client.dispatchAction("/store-value", {
						uiShowCollection: true
					});
					this.client.dispatchAction("/store-value", {
						onboardingFrom: undefined
					});
					this.props.history.push("/dashboard");
					break;
				case "start":
					this.client.dispatchAction("/store-value", {
						onboardingFrom: undefined
					});
					this.props.history.push("/start");
					break;
				default:
					break;
			}
		} catch (err) {
			// TODO: Error handling
			this.props.history.push("/start");
			console.log(err);
		}
	}

	render() {
		const stepData = onboardingData.steps[this.state.step];
		// Failsafe
		if (this.state.fontName && !this.state.onboardingFrom) {
			this.props.history.push("/dashboard");
		}

		return (
			<div className="onboarding-app">
				<div className="onboarding-wrapper">
					<Button
						neutral
						className="backToApp"
						onClick={() => {
							this.deleteFamily(this.state.family);
						}}
					>
						Back to library
					</Button>
					{this.defineRender(stepData)}
					<Button
						className="nextStep"
						onClick={() => {
							this.state.step < onboardingData.steps.length - 1
								? this.getNextStep()
								: this.props.history.push("/dashboard");
						}}
					>
						{this.state.step < onboardingData.steps.length - 1
							? "Next"
							: "Finish"}
					</Button>
					<FontUpdater
						extraFonts={
							this.state.alternateList &&
							this.state.baseAlternateFont
								? [
										...this.state.alternateList,
										this.state.baseAlternateFont
									]
								: undefined
						}
					/>

					<div className="bubbles">
						{onboardingData.steps.map((step, index) => (
							<div
								className={`bubble ${
									index === this.state.step ? "active" : ""
								} ${index < this.state.step ? "previous" : ""}`}
								onClick={() => {
									this.setState({ step: index });
								}}
							/>
						))}
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
					family.variants = family.variants.filter(variant => variant.id !== deleteVariant.id);
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
				const variants = family.variants.map(variant => ownProps.deleteVariant(variant.id));

				return Promise.all([...variants, mutate({variables: {id: family.id}})]);
			},
		}),
		options: {
			update: (store, {data: {deleteFamily}}) => {
				const data = store.readQuery({query: libraryQuery});

				data.user.library = data.user.library.filter(font => font.id !== deleteFamily.id);

				store.writeQuery({
					query: libraryQuery,
					data,
				});
			},
		},
	}),
)(OnboardingApp);
