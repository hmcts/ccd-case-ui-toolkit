
const CucumberReportLogger = require('../support/reportLogger');
const demoAppPage = require('../pageObjects/demoAppheader.page');

var { defineSupportCode } = require('cucumber');

defineSupportCode(function ({ And, But, Given, Then, When }) {

    Then('I see field with cssLocator displayed {string}', async function (locator) {
        
        const cssElement = $(".example " + locator);
        expect(await cssElement.isPresent()).to.be.true;

    })

    Given('I navigate to demo app', async function () {
        await demoAppPage.loadApp();
    
    })


});