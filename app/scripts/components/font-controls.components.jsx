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
				<ControlsTabs tab={this.state.fontControls.tab} >
					<ControlsTab iconId="functional" name="functional">
						<Sliders params={params}/>
					</ControlsTab>
					<ControlsTab iconId="style" name="style">
						<Sliders params={params}/>
					</ControlsTab>
					<ControlsTab iconId="serif" name="serif">
						<Sliders params={params}/>
					</ControlsTab>
				</ControlsTabs>
			</div>
		)
	}
}
