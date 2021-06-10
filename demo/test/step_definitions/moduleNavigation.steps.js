
const CucumberReportLogger = require('../support/reportLogger');
const demoAppPage = require('../pageObjects/demoAppheader.page');

var { defineSupportCode } = require('cucumber');

defineSupportCode(function ({ And, But, Given, Then, When }) {
    
    Given('I navigate to module page {string}', async function(moduleName){
        await demoAppPage.clickHeader(moduleName)

    })


});