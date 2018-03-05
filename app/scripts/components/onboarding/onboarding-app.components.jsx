import React from "react";
import _uniq from "lodash/uniq";
import Button from "../shared/new-button.components";
import { browserHistory } from "react-router";
import OnboardingSlider from "./onboarding-slider.components";
import onboardingData from "../../data/onboarding.data";
import Lifespan from "lifespan";
import LocalClient from "../../stores/local-client.stores";
import FontUpdater from "../font-updater.components";

const flatten = list =>
	list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
export default class OnboardingApp extends React.PureComponent {
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
					fontName: head.toJS().d.fontName,
					parameters: flatten(
						headJS.fontParameters.reduce((a, b) => [
							a,
							...b.parameters
						])
					),
					glyphs: head.toJS().d.glyphs
				});
				this.getAlternateFonts();
			})
			.onDelete(() => {
				this.setState({ parameters: [] });
			});

		this.getSliderData = this.getSliderData.bind(this);
		this.renderSliders = this.renderSliders.bind(this);
		this.renderSerifs = this.renderSerifs.bind(this);
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
		const allStrings = Object.keys(stepData.letters).reduce(
			(previous, key) => previous + stepData.letters[key],
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

	render() {
		const stepData = onboardingData.steps[this.state.step];

		return (
			<div className="onboarding-app">
				<div className="onboarding-wrapper">
					<Button neutral className="backToApp" onClick={() => {}}>
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
