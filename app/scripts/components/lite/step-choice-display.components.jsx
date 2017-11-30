import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import Lifespan from 'lifespan';

import LocalClient from '~/stores/local-client.stores.jsx';

export default class StepChoiceDisplay extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
            steps: [],
            step: {},
            choice: {},
        };
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.selectChoice = this.selectChoice.bind(this);
    }

    async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
		const store = await this.client.fetch('/prototypoStore');

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {

				if (!head.toJS().d.preset) {
					this.client.dispatchAction('/fetch-preset', store.head.toJS().variant.id);
				}

				this.setState({					
					steps: head.toJS().d.preset ? head.toJS().d.preset.steps : [],
                    step: head.toJS().d.step || {},
                    choice: head.toJS().d.choice || {},
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
    }
    
    selectChoice(choice) {
        var step = undefined;
        this.state.steps.forEach((sstep) => {
            sstep.choices.forEach((schoice) => {
                if (schoice.id === choice.id) {
                    step = sstep;
                }
            })
        })
        if (step) {
            this.client.dispatchAction('/select-choice', {choice, step});
        }		
	}

	render() {
		return this.state.choices
            ? (<div
                className={`StepChoiceDisplay ${this.props.className}`}
                style={this.props.style}
                onMouseDown={this.props.onMouseDown}
                onMouseUp={this.props.onMouseUp}
                onTouchStart={this.props.onTouchStart}
                onTouchEnd={this.props.onTouchEnd}
            >
                {this.state.steps.map(step => (
                    <div key={`step ${step.id}`}>
                        <h3>{step.name}</h3>
                        <ul>
                            {step.choices.map(choice => (
                                <li onClick={() => { this.selectChoice(choice); }} key={`choice ${choice.id}`} className={choice.id === this.state.choice.id ? 'active no-cursor' : 'no-cursor'}>{choice.name}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>)
            : false;
	}
}
