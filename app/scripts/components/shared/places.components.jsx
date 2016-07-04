import React from 'react';
import Select from 'react-select';

import formatHit from './places/formatHit.js';
import formatInputValue from './places/formatInputValue.js';
import formatDropdownValue from './places/formatDropdownValue.jsx';

export default class Places extends React.Component {
	constructor(props) {
		super(props);

		this.loadAddresses = this.loadAddresses.bind(this);
	}

	renderOption(option) {
		return (
			<span dangerouslySetInnerHTML={{__html: formatDropdownValue(option)}} />
		);
	}

	renderValue(option) {
		return (
			<span dangerouslySetInnerHTML={{__html: formatInputValue(option.suggestion)}} />
		);
	}

	loadAddresses(input) {
		const {options, appId, apiKey} = this.props;
		const args = Object.assign({
			query: input,
			language: 'DE',
		}, options);

		return fetch('https://places-dsn.algolia.net/1/places/query', {
			method: 'POST',
			headers: {
				'X-Algolia-Application-Id': appId,
				'X-Algolia-API-Key': apiKey,
			},
			mode: 'cors',
			body: JSON.stringify(args),

		}).then((response) => {
			return response.json();

		}).then((data) => {
			const opts = {
				options: data.hits.map((hit, hitIndex) => {
					return formatHit({
						hit,
						hitIndex,
						query: input,
					});
				}),
			};

			return opts;
		});
	}

	dontFilter(options) {
		return options;
	}

	render() {
		return (
			<Select.Async {...this.props}
				loadOptions={this.loadAddresses}
				filterOptions={this.dontFilter}
				optionRenderer={this.renderOption}
				valueRenderer={this.renderValue}
			/>
		);
	}
}
