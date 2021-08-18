

const CucumberReportLogger = require('../support/reportLogger');

var { defineSupportCode } = require('cucumber');
const jsonpath = require('jsonpath');

const BrowserWaits = require('../support/customWaits');
const MockApp = require('../nodeMock/app');
const CCDCaseConfig = require('../nodeMock/ccd/ccdCaseConfig/caseCreateConfigGenerator');
const { getDateTimeTestEvent, getBlankEvent, addPageToEvent, addCaseField, setCaseFieldProps } = require('../mockData/caseEvent');
const caseEditPage = require('../pageObjects/ccdCaseEditPages')
const SoftAssert = require('../support/softAssert');

defineSupportCode(function ({ And, But, Given, Then, When }) {

    Then('I see case edit page displayed', async function () {
        expect(await caseEditPage.amOnPage(), "Case edit page is not displayed").to.be.true;
    });


    When('I enter case event field values for event {string}', async function (eventRef, fielValuesDT) {
        const mockCaseEvent = global.scenarioData[eventRef];
        const fieldValues = fielValuesDT.hashes();
        for (let i = 0; i < fieldValues.length; i++) {
            const pathArr = fieldValues[i].path.split(".");

            const fieldConfig = mockCaseEvent.getCaseFieldConfig(pathArr[0]);
            const inputFieldConfig = mockCaseEvent.getInputFieldConfig(fieldConfig, pathArr);
            await caseEditPage.inputCaseField(inputFieldConfig, fieldValues[i].value, fieldValues[i].cssSelector)
        }
    });

  

    When('I click collection add new btn for field {string} in event {string}', async function (fieldPath, eventRef) {
        const mockCaseEvent = global.scenarioData[eventRef];
        const pathArr = fieldPath.split(".");
        const caseFieldConfig = mockCaseEvent.getCaseFieldConfig(pathArr[0]);
        await caseEditPage.clickAddNewCollectionItemBtn(caseFieldConfig, fieldPath);
    });

    Then('I validate request body {string} of event validate api', async function (requestBodyReference, datatable) {
        // step definition code here
        await BrowserWaits.waitForCondition(() => global.scenarioData[requestBodyReference] !== null);
        const reqBody = global.scenarioData[requestBodyReference];
        const softAsseert = new SoftAssert();
        const dataTableHashes = datatable.hashes();
        CucumberReportLogger.AddMessage("Request body in validation");
        CucumberReportLogger.AddJson(reqBody);
        for (let i = 0; i < dataTableHashes.length; i++) {
            const matchValues = jsonpath.query(reqBody, dataTableHashes[i].pathExpression);
            softAsseert.setScenario(`Validate case field present in req body ${dataTableHashes[i].pathExpression}`);
            await softAsseert.assert(() => expect(matchValues.length > 0, `path ${dataTableHashes[i].pathExpression} not found in req body`).to.be.true);
            if (matchValues.length > 0) {
                softAsseert.setScenario(`Validate feidl valUe in req body ${dataTableHashes[i].pathExpression}`)
                await softAsseert.assert(() => expect(matchValues[0], `path ${dataTableHashes[i].pathExpression} not matching expected`).to.equal(dataTableHashes[i].value));
            }
        }
        softAsseert.finally();
    });

    When('I click continue in event edit page', async function () {
        await caseEditPage.clickContinue();
    });


    Then('I see validation error for field with id {string}', async function (fieldId) {
        expect(await caseEditPage.isFieldLevelValidationErrorDisplayed(fieldId), "field level error validation not displayed or not as expected").to.be.true;
    });


    Then('I see case event validation alert error summary messages', async function (datatable) {
        const messageHashes = datatable.hashes();
        for (let i = 0; i < messageHashes.length; i++) {
            expect(await caseEditPage.getValidationAlertMessageDisplayed(), 'Expected field error validation message not displayed in error summary').to.include(messageHashes[i].message);
        }
    });


});