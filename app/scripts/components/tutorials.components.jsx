import React from 'react';

export default class Tutorials extends React.Component {
	render() {
		return (
			<div className="tutorials">
				<h2>Guides</h2>
				<p>Are you a bit lost ? There's probably a guide to help you :)</p>
				<div className="tutorials-list">
					<Tutorial
						name="Basics"
						subText="Discovers prototypo basics features"
					/>
					<Tutorial name="Parameters" subText="Play with your font" />
					<Tutorial
						name="Families"
						subText="Create and manage families and variants"
					/>
					<Tutorial
						name="Glyph list"
						subText="Personalized your glyph list to make it easier to find the glyphs you're working on"
					/>
					<Tutorial name="Views" subText="Setup your views for easier work" />
					<Tutorial
						name="Individualize Parameters"
						subText="Discovers the power of good groups of individualized glyphs"
					/>
				</div>
			</div>
		);
	}
}

class Tutorial extends React.Component {
	render() {
		return (
			<div className="tutorial">
				<h3 className="tutorial-title">{this.props.name}</h3>
				<p className="tutorial-description">{this.props.subText}</p>
			</div>
		);
	}
}
