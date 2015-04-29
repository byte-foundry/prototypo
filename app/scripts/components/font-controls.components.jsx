import React from 'react';
import {ControlsTabs,ControlsTab} from './controls-tabs.components.jsx';
import {Sliders} from './sliders.components.jsx';

export default class FontControls extends React.Component {
	render() {
		const params = [
			{
				title:"Thickness",
				value:57,
			},
			{
				title:"Thickness",
				value:57,
			},
			{
				title:"Thickness",
				value:57,
			},
			{
				title:"Thickness",
				value:57,
			}
		];

		return (
			<div class="font-controls">
				<ControlsTabs>
					<ControlsTab iconId="functional">
						<Sliders params={params}/>
					</ControlsTab>
					<ControlsTab iconId="style">
						<Sliders params={params}/>
					</ControlsTab>
					<ControlsTab iconId="serif">
						<Sliders params={params}/>
					</ControlsTab>
				</ControlsTabs>
			</div>
		)
	}
}
