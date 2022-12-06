
const CucumberReportLogger = require('../support/reportLogger');
const demoAppPage = require('../pageObjects/demoAppheader.page');
const eventmessages = require('../pageObjects/eventmessages');
var { defineSupportCode } = require('cucumber');

defineSupportCode(function ({ And, But, Given, Then, When }) {

    Then('I see field with cssLocator displayed {string}', async function (locator) {
        
        const cssElement = $(".example " + locator);
        expect(await cssElement.isPresent()).to.be.true;

    })

    Given('I navigate to demo app', async function () {
        await demoAppPage.loadApp();
    
    })

    Given('I reset reference variable {string} value to null', async function(reference){
        global.scenarioData[reference] = null;
    });

    Then('I see event triggered with message {string}', async function(message){
        const lastMessage = await eventmessages.getLastMessage();
        expect(lastMessage).to.contain(message)
    });


});