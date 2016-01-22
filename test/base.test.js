module.exports = {
	'Test login' : function (browser) {
		browser
			.init()
			.waitForElementVisible('input#email-sign-in', 10000)
			.setValue('input#email-sign-in',process.env.PROTOTYPO_LOGIN)
			.setValue('input#password-sign-in', process.env.PROTOTYPO_PASS)
			.click('input[type=submit]')
			.pause(2000)
			.waitForElementVisible('#dashboard', 10000)
			.end();
	},
	'this is false': function(browser) {
		browser.assert.equal(false, true);
	}
};
