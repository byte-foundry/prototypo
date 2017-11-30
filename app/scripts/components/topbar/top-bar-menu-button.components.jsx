import React from 'react';

import Button from '../shared/button.components';

class TopBarMenuButton extends React.PureComponent {
	render() {
		return <Button {...this.props} small />;
	}
}

TopBarMenuButton.defaultProps = {};

TopBarMenuButton.propTypes = {};

export default TopBarMenuButton;
