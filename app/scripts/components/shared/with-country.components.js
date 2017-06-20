import React from 'react';

const withCountry = (component) => {
	return class extends React.Component {
		static displayName = `withCountry(${component.displayName || component.name})`;

		constructor(props) {
			super(props);

			this.state = {
				country: 'US',
			};
		}

		async componentDidMount() {
			try {
				const response = await fetch('//freegeoip.net/json/');
				const data = await response.json();

				this.setState({country: data.country_code});
			}
			catch (err) {
				// Failed to fetch can happen if the user has a blocker (ad, tracker...)
				trackJs.track(`Error when getting the country: ${err.message}`);
			}
		}

		render() {
			const {country} = this.state;

			return React.createElement(component, {
				...this.props,
				country,
			});
		}
	};
}

export default withCountry;
