var { defineSupportCode } = require('cucumber');

const MockApp = require('../nodeMock/app');

// const browserUtil = require('../../util/browserUtil');
// const nodeAppMockData = require('../../../nodeMock/nodeApp/mockData');
const CucumberReporter = require('../support/reportLogger');
const dateTimePickerComponent = require('../pageObjects/dateTimePicker');
const SoftAssert = require('../support/softAssert');

defineSupportCode(function ({ And, But, Given, Then, When }) {

    When('I validate datetime field values in case edit page', async function (fielValuesDT) {
        const softAssert = new SoftAssert();
        const fieldValues = fielValuesDT.hashes();
        for (let i = 0; i < fieldValues.length; i++) {
            const fieldVal = await dateTimePickerComponent.getFieldValue(fieldValues[i].cssSelector, null);
            softAssert.setScenario(`Validating field value at ${fieldValues[i].cssSelector}`);
            await softAssert.assert(() => expect(fieldVal).to.equal(fieldValues[i].value));
        }
        softAssert.finally();

    });

    Then('I validate date time readonly field', async function (fielValuesDT){
        const softAssert = new SoftAssert();

        const fieldValues = fielValuesDT.hashes();
        for (let i = 0; i < fieldValues.length; i++) {
            const fieldVal = await dateTimePickerComponent.getReadonlyFieldValue(fieldValues[i].label, null)
            softAssert.setScenario(`Validating read only field value with label ${fieldValues[i].label}`);
            await softAssert.assert(() => expect(fieldVal).to.equal(fieldValues[i].value));
        }
        softAssert.finally();

   }); 


});
