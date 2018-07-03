import React from 'react';
import {Link} from 'react-router-dom';
import Lifespan from 'lifespan';

import LocalClient from '../stores/local-client.stores';
import FontMediator from '../prototypo.js/mediator/FontMediator';

import Toile from '../toile/toile';

function GlyphTest(props) {
	return (
		<div className="glyph-test">
			<div className="glyph-displayed">
				{String.fromCharCode(props.unicode)}
			</div>
			<Link to={`/testglyph/${props.unicode}`} className="glyph-test-link">
				view
			</Link>
			<canvas
				className="glyph-canvas"
				width="300"
				height="300"
				style={{width: '300px', height: '300px'}}
				ref={props.canvasRef}
			/>
		</div>
	);
}

function GlyphError(props) {
	return (
		<div className="glyph-error">
			<div className="glyph-error-display">{props.glyph.error.message}</div>
			<div
				className="glyph-error-stack"
				dangerouslySetInnerHTML={{
					__html: props.glyph.error.stack
						.replace(/</g, '&lt;')
						.replace(/\n/g, '<br />'),
				}}
			/>
			<div className="glyph-error-glyph">
				{String.fromCharCode(props.glyph.unicode)}
			</div>
		</div>
	);
}

export default class FontTester extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
		this.toile = new Toile();
		this.toile.setCamera({x: 0, y: 0}, 0.2, -200);

		this.client
			.getStore('/fontInstanceStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					glyphArray: head.toJS().d.glyphArray,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentDidUpdate() {
		const glyphs = window.glyphArray || [];

		glyphs.forEach((glyph, index) => {
			if (!glyph.error) {
				this.toile.clearCanvas(
					300,
					300,
					this[glyph.name + index].getContext('2d'),
				);
				this.toile.drawGlyph(
					glyph,
					[],
					false,
					this[glyph.name + index].getContext('2d'),
				);
			}
		});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	computeJohnFell() {
		FontMediator.instance().getAllGlyphForCanvas('john-fell.ptf');
	}

	computeVenus() {
		FontMediator.instance().getAllGlyphForCanvas('venus.ptf');
	}

	computeAntique() {
		FontMediator.instance().getAllGlyphForCanvas('antique.ptf');
	}

	computeElzevir() {
		FontMediator.instance().getAllGlyphForCanvas('elzevir.ptf');
	}

	computeSpectral() {
		FontMediator.instance().getAllGlyphForCanvas('gfnt.ptf');
	}

	render() {
		const glyphs = window.glyphArray || [];

		const glyphsCanvas = glyphs
			.map((glyph, index) => {
				if (glyph.error) {
					return <GlyphError glyph={glyph} />;
				}
				return (
					<GlyphTest
						unicode={glyph.unicode}
						canvasRef={(el) => {
							this[glyph.name + index] = el;
						}}
						key={glyph.name + index}
					/>
				);
			})
			.filter(el => el);

		return (
			<div style={{height: '100%'}}>
				<div>
					<button onClick={this.computeJohnFell}>john-fell</button>
					<button onClick={this.computeVenus}>venus</button>
					<button onClick={this.computeElzevir}>elzevir</button>
					<button onClick={this.computeSpectral}>spectral</button>
					<button onClick={this.computeAntique}>antique</button>
				</div>
				<div
					style={{
						display: 'flex',
						flexFlow: 'row wrap',
						width: '100%',
						height: '100%',
						overflow: 'auto',
					}}
				>
					{glyphsCanvas}
				</div>
			</div>
		);
	}
}
