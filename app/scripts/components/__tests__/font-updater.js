import React from 'react';
import {render, cleanup} from 'react-testing-library';
import TestRenderer from 'react-test-renderer';

import FontUpdater from '../font-updater.components';

jest.mock('../../prototypo.js/mediator/FontMediator');

const FontMediator = require('../../prototypo.js/mediator/FontMediator')
	.default;

afterEach(cleanup);

describe('FontUpdater', () => {
	it('should render', () => {
		render(
			<FontUpdater
				name="Ma fonte"
				template="gfnt.ptf"
				values={{}}
				subset="Hello"
			/>,
		);

		expect(FontMediator.instance().getFont).toHaveBeenCalled();
	});

	// This test uses react-test-renderer because it is not possible to access
	// the component's instance from react-testing-library. This is a bad practice.
	// FontUpdater may be the one responsible for adding fonts to the document.
	// This should be something we might have to consider later.
	it('should update only if props changed', () => {
		const testRenderer = TestRenderer.create(
			<FontUpdater
				name="Ma fonte"
				template="gfnt.ptf"
				values={{test: true}}
				subset="Hello"
			/>,
		);

		const testInstance = testRenderer.getInstance();

		expect(
			testInstance.shouldComponentUpdate({
				...FontUpdater.defaultProps,
				name: 'Ma fonte',
				template: 'gfnt.ptf',
				values: {test: true},
				subset: 'Hello',
			}),
		).not.toBe(true);

		expect(
			testInstance.shouldComponentUpdate({
				...FontUpdater.defaultProps,
				name: 'Ma fonte',
				template: 'gfnt.ptf',
				values: {test: true},
				subset: 'Helloo',
			}),
		).not.toBe(true);

		expect(
			testInstance.shouldComponentUpdate({
				...FontUpdater.defaultProps,
				name: 'Ma fonte',
				template: 'gfnt.ptf',
				values: {test: true},
				subset: 'Hellox',
			}),
		).toBe(true);

		expect(
			testInstance.shouldComponentUpdate({
				...FontUpdater.defaultProps,
				name: 'Ma fonte',
				template: 'gfnt.ptf',
				values: {change: {is: {deep: true}}},
				subset: 'Hello',
			}),
		).toBe(true);

		testRenderer.unmount();
	});
});
