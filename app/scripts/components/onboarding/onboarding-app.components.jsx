import React from "react";
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
					)
				});
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

	changeParam(params) {
		this.client.dispatchAction("/change-param", params);
	}

	renderHighlightedText(letters) {
		const charactersArr = "Hamburgefonstiv".split("");

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
		return (
			<div className="step step-alternates">
				<h1>{stepData.title}</h1>
				{this.props.children}
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
								: this.props.history.push('/dashboard');
						}}
					>
						{this.state.step < onboardingData.steps.length - 1
							? "Next"
							: "Finish"}
					</Button>
					<FontUpdater />

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
