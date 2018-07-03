import React from 'react';

const withCountry = component =>
	class extends React.Component {
		static displayName = `withCountry(${component.displayName
			|| component.name})`;

		constructor(props) {
			super(props);

			this.state = {
				country: 'US',
			};
		}

		async componentDidMount() {
			try {
				const response = await fetch('//ipinfo.io/json');
				const data = await response.json();

				this.setState({country: data.country});
			}
			catch (err) {
				// Failed to fetch can happen if the user has a blocker (ad, tracker...)
				window.trackJs.track(`Error when getting the country: ${err.message}`);

				// trying another server just to be sure
				try {
					const response = await fetch('//get.geojs.io/v1/ip/country.json');
					const data = await response.json();

					this.setState({country: data.country});
				}
				catch (err2) {
					// giving up
					window.trackJs.track(
						`Error when getting the country: ${err2.message}`,
					);
				}
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

export default withCountry;
