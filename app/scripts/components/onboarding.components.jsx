import React from 'react';
import Classnames from 'classnames';
import Tether from 'tether';

export class OnBoarding extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			reset: (new Date()).getTime(),
		};
	}

	createTether() {
		if (this.tether) {
			this.tether.destroy();
		}

		const target = this.step ? document.getElementById(this.step.props.target) : undefined;

		if (this.step && this.step.props.target && target) {
			this.tether = new Tether({
				target,
				element: React.findDOMNode(this.refs.onboarding),
				attachment: this.step.props.elementAlign || 'middle left',
				targetAttachment: this.step.props.targetAlign || 'middle right',
				offset: this.step.props.offset || '-10px -50px',
			});
		}
		else {
			if (this.tether) {
				this.setState({
					reset: (new Date()).getTime(),
				});
				this.tether = undefined;
			}
		}
	}
	componentDidMount() {
		this.createTether();
	};

	componentDidUpdate() {
		this.createTether();
	};

	render() {
		const step = this.step = _.find(this.props.children, (child) => {
			return child.props.name === this.props.step;
		});

		const classes = Classnames({
			onboarding: true,
			'full-modal-container': step && ( step.props.type === 'fullModal' ),
			'indicator': step && ( step.props.type === 'indicator' ),
			'is-inverse': step && (step.props.inverseArrow),
			'is-top': step && (step.props.arrowPos),
		});

		const styles = {
			top:0,
			left:0,
			position:'absolute',
			transform:'none',
		}

		if (this.step && this.step.props.width) {
			styles.width = this.step.props.width;
		}


		return (
			<div className={classes} ref="onboarding" key={this.state.reset} style={styles}>
				{step}
			</div>
		)
	}
}

export class OnBoardingStep extends React.Component {
	render() {
		return (
			<div className="onboarding-step">
				{this.props.children}
			</div>
		)
	}
}
