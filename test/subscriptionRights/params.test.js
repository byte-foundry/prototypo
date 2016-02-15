module.exports = {
	'Should have access to all params': function(browser) {
		browser
			.init()
			.waitForElementVisible('input#email-sign-in', 20000)
			.setValue('input#email-sign-in', 'test@registered-annual.com')
			.setValue('input#password-sign-in', process.env.PROTOTYPO_PASS)
			.click('input[type=submit]')
			.pause(2000)
			.waitForElementVisible('#dashboard', 20000)
			.click('.controls-tabs-icon:nth-child(1)')
			.pause(200)
			.elements('css selector', '.sliders .slider', function(result) {
				browser.assert.equal(result.value.length, 9);
			})
			.elements('css selector', '.sliders .slider.is-disabled', function(result) {
				browser.assert.equal(result.value.length, 0);
			})
			.end();
	},
	'Should not have access to all params': function(browser) {
		browser
			.init()
			.waitForElementVisible('input#email-sign-in', 20000)
			.setValue('input#email-sign-in', 'test@registered-free.com')
			.setValue('input#password-sign-in', process.env.PROTOTYPO_PASS)
			.click('input[type=submit]')
			.pause(2000)
			.waitForElementVisible('#dashboard', 20000)
			.click('.controls-tabs-icon:nth-child(1)')
			.pause(200)
			.elements('css selector', '.sliders .slider', function(result) {
				browser.assert.equal(result.value.length, 9);
			})
			.elements('css selector', '.sliders .slider.is-disabled', function(result) {
				browser.assert.equal(result.value.length, 7);
			})
			.end();
	}
};
