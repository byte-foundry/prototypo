module.exports = {
	before: function(browser, done) {
		browser
			.init()
			.waitForElementVisible('input#email-sign-in', 20000)
			.setValue('input#email-sign-in', 'test@registered-annual.com')
			.setValue('input#password-sign-in', process.env.PROTOTYPO_PASS)
			.click('input[type=submit]')
			.pause(20000)
			.waitForElementVisible('#dashboard', 20000, false, done);
	},
	after: function(browser) {
		browser.end();
	},
	'Should be able to toggle views': function (browser) {
		browser
			.elements('css selector', '#topbar > ul > li', function(result) {
				browser.moveTo(result.value[2].ELEMENT)
					.waitForElementVisible('#topbar > ul > li:nth-child(3) > ul', 2000)
					.click('#topbar > ul > li:nth-child(3) > ul li:nth-child(2)')
					.waitForElementNotVisible('.prototypo-canvas', 2000)
					.click('#topbar > ul > li:nth-child(3) > ul li:nth-child(2)')
					.waitForElementVisible('.prototypo-canvas', 2000)
					.click('#topbar > ul > li:nth-child(3) > ul li:nth-child(3)')
					.waitForElementNotPresent('.prototypo-text', 2000)
					.click('#topbar > ul > li:nth-child(3) > ul li:nth-child(3)')
					.waitForElementVisible('.prototypo-text', 2000)
					.click('#topbar > ul > li:nth-child(3) > ul li:nth-child(4)')
					.waitForElementNotPresent('.prototypo-word', 2000)
					.click('#topbar > ul > li:nth-child(3) > ul li:nth-child(4)')
					.waitForElementVisible('.prototypo-word', 2000);
			});
	},
	'Close icon should work on each views': function (browser) {
		browser
			.click('.prototypo-word .close-button')
			.waitForElementNotPresent('.prototypo-word', 2000)
			.click('.prototypo-text .close-button')
			.waitForElementNotPresent('.prototypo-text', 2000)
			.click('.prototypo-canvas .close-button')
			.waitForElementVisible('.prototypo-canvas', 2000);
		browser
			.elements('css selector', '#topbar > ul > li', function(result) {
				browser.moveTo(result.value[2].ELEMENT)
					.click('#topbar > ul > li:nth-child(3) > ul li:nth-child(4)')
					.waitForElementVisible('.prototypo-word', 2000)
					.click('.prototypo-canvas .close-button')
					.waitForElementNotPresent('.prototypo-canvas', 2000)
					.moveTo(result.value[2].ELEMENT)
					.click('#topbar > ul > li:nth-child(3) > ul li:nth-child(2)')
					.click('#topbar > ul > li:nth-child(3) > ul li:nth-child(3)');
			});
	},
};
