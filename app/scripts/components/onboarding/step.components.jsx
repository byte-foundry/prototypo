import React from 'react';

import OnboardingSlider from './onboarding-slider.components';
import HighlightedText from './highlighted-text.components';

const OnboardingStep = ({
	children,
	title,
	description,
	type,
	fontName,
	sliders,
	letters,
	parameters,
	values,
	onChangeParam,
}) => {
	return (
		<div className="step step-sliders-wrapper">
			<h3>{title}</h3>
			<p className="description">{description}</p>
			{(type === 'sliders' || type === 'serifs') && (
				<div
					className="text"
					style={{fontFamily: fontName}}
				>
					<HighlightedText letters={letters} />
				</div>
			)}
			{(type === 'sliders' || type === 'serifs') && (
				<div className="step-sliders">
					{sliders.map((slider) => {
						const sliderData = parameters.find(p => p.name === slider);

						return (
							sliderData && (
								<OnboardingSlider
									key={sliderData.name}
									label={sliderData.label}
									min={sliderData.minAdvised}
									max={sliderData.maxAdvised}
									step={sliderData.step}
									value={values[sliderData.name]}
									onChange={onChangeParam}
									name={sliderData.name}
								/>
							)
						);
					})}
				</div>
			)}
			{children}
		</div>
	);
};

export default OnboardingStep;
