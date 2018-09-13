import PropTypes from 'prop-types';
import React from 'react';

// import {tmpUpload} from '../../services/graphcool.services';

import Button from './shared/new-button.components';

const HostedVariantLine = ({url, createdAt}) => (
	<li key={createdAt}>
		<b>{createdAt.slice(0, 10)}</b>{' '}
		<input type="text" onFocus={e => e.target.select()} value={url} />
	</li>
);

export default class HostVariant extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			displayAll: true,
		};
	}

	render() {
		const {uploads, latestUploadUrl, status, publishNewVersion} = this.props;
		const {displayAll} = this.state;

		const publishing
			= status === 'generating' || status === 'uploading' || status === 'hosting';
		const published = status === 'published';

		const topElements = (publishing && <p>Working... {status}</p>) || (
			<div>
				{latestUploadUrl ? (
					<input
						type="text"
						onFocus={e => e.target.select()}
						value={latestUploadUrl}
					/>
				) : (
					<div>No latest link available, publish a new version to get one!</div>
				)}
				<Button onClick={publishNewVersion} outline neutral fluid>
					Publish a new version
				</Button>
			</div>
		);

		if (uploads.length <= 0) {
			return topElements;
		}

		return (
			<div>
				{published && (
					<p>
						Your hosted font has been updated and it should be available soon
					</p>
				)}
				<div>
					<div>
						{!displayAll && (
							<a onClick={this.showOlderVersions} href="#">
								Want to use a specific older version of the font?
							</a>
						)}
						{topElements}
						{displayAll && (
							<div>
								<hr />
								{(uploads.length > 0 && (
									<ul>
										{uploads.map(({url, version, createdAt}) => (
											<HostedVariantLine
												key={version}
												url={url}
												createdAt={createdAt}
											/>
										))}
									</ul>
								)) || (
									<div>
										No version has been published yet. Click on publish to get a
										link.
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}
}

HostVariant.defaultProps = {
	latestUploadUrl: '',
	uploads: [],
	status: '',
	publishNewVersion: () => {},
};

HostVariant.propTypes = {
	latestUploadUrl: PropTypes.string,
	uploads: PropTypes.arrayOf(
		PropTypes.shape({
			url: PropTypes.string,
			version: PropTypes.string,
			createdAt: PropTypes.string,
		}),
	),
	status: PropTypes.string,
	publishNewVersion: PropTypes.func,
};
