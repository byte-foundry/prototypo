module.exports = {
	'Test login': function(browser) {
		browser
			.init()
			.waitForElementVisible('input#email-sign-in', 20000)
			.setValue('input#email-sign-in','test@registered-monthly.com')
			.setValue('input#password-sign-in', process.env.PROTOTYPO_PASS)
			.click('input[type=submit]')
			.pause(2000)
			.waitForElementVisible('#dashboard', 20000)
			.end();
	},
	'Test login fail': function(browser) {
		browser
			.init()
			.waitForElementVisible('input#email-sign-in', 20000)
			.setValue('input#email-sign-in', "test@no-registered.com")
			.setValue('input#password-sign-in', process.env.PROTOTYPO_PASS)
			.click('input[type=submit]')
			.pause(2000)
			.waitForElementVisible('.warning-message', 20000)
			.end();
	}
};
