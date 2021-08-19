

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

    When('I click cancel in case edit page', async function(){
        await caseEditPage.clickCancelLinkInEditPage();
    });


    Then('I validate config {string} case edit wizard pages and fields in pages', async function (configReference) {
        const caseConfigInstance = global.scenarioData[configReference];
        const caseConfig = caseConfigInstance.getCase();
        let validateReq = null;
        MockApp.addIntercept('/data/case-types/:caseType/validate', (req, res, next) => {
            validateReq = req.body;
            //  console.log("/data/case-types/:caseType/validate req received : " + JSON.stringify(validateReq,2)); 
            next();
        });

        let submissionReq = null;
        MockApp.addIntercept('/data/case-types/:caseType/cases', (req, res, next) => {
            submissionReq = req.body;
            console.log("/data/case-types/:caseType/cases req received : " + submissionReq);
            next();
        });
        await MockApp.stopServer();
        await MockApp.startServer();


        let eventData = {};
        for (const wizardPage of caseConfig.wizard_pages) {
            await caseEditPage.waitForPage();
            expect(await caseEditPage.getPageTitle()).to.contains(wizardPage.label);
            const thisPageEventData = {};

            for (const pageField of wizardPage.wizard_page_fields) {

                const fieldConfig = caseConfig.case_fields.filter(field => field.id === pageField.case_field_id)[0];
                // if (!fieldConfig.show_condition){
                //     expect(await CaseEditPage.isFieldDisplayed(fieldConfig)).to.be.true;
                //     thisPageEventData[fieldConfig.id] = await CaseEditPage.inputCaseField(fieldConfig); 
                // }  
                expect(await caseEditPage.isFieldDisplayed(fieldConfig)).to.be.true;
                thisPageEventData[fieldConfig.id] = await caseEditPage.inputCaseField(fieldConfig);

            }
            validateReq = null;
            await caseEditPage.clickContinue();
            await BrowserWaits.waitForCondition(function () { return validateReq !== null; });
            expect(validateReq.data).to.deep.equal(thisPageEventData);
            eventData = Object.assign(eventData, thisPageEventData)

        }
        await caseEditPage.waitForChecYourAnswersPage();
        await caseEditPage.validateCheckYourAnswersPage(caseConfig);

        await caseEditPage.clickSubmit();
        await BrowserWaits.waitForCondition(async () => submissionReq !== null);
        expect(submissionReq.data).to.deep.equal(eventData);


    });



    When('I input fields in case edit page from event {string} with values', async function (eventConfigRef, datatable) {
        const caseConfigInstance = global.scenarioData[eventConfigRef];
        const caseConfig = caseConfigInstance.getCase();
        const fieldValues = datatable.hashes();

        for (const fieldValue of fieldValues) {
            const fieldConfig = caseConfigInstance.getCaseFieldConfig(fieldValue.fieldId);

            let value = fieldValue.value;
            if (fieldConfig.field_type.type.toLowerCase().includes("list")) {
                value = null;
                for (const listItem of fieldConfig.field_type.fixed_list_items) {
                    console.log(`${fieldValue.value} is in ${JSON.stringify(listItem)}`);
                    if (listItem.code === fieldValue.value) {
                        value = listItem;
                        break;
                    }
                }
                if (value === null) {
                    throw new Error(`${fieldValue.fieldId} is list item and Provided value "${fieldValue.value}" not present in fieldConfig fixed_list_items ${JSON.stringify(fieldConfig.field_type.fixed_list_items)} `);
                }
            }
            await caseEditPage.inputCaseField(fieldConfig, value);
        }
    });


    Then('I validate fields display in case edit page from event {string}', async function (eventConfigRef, datatable) {
        await BrowserWaits.waitForSeconds(1);
        const caseConfigInstance = global.scenarioData[eventConfigRef];
        const caseConfig = caseConfigInstance.getCase();
        const fieldValues = datatable.hashes();
        for (const fieldValue of fieldValues) {
            const fieldConfig = caseConfigInstance.getCaseFieldConfig(fieldValue.fieldId)
            const isExpectedToDisplay = fieldValue.isDisplayed.includes("true") ? true : false;
            expect(await caseEditPage.isFieldDisplayed(fieldConfig), `${fieldValue.fieldId} is ${isExpectedToDisplay ? "not" : ""} displayed`).to.equal(isExpectedToDisplay);
        }

    });


    Then('I validate event page continue on validate request error status code {int}', async function (statusCode) {
        let validateReq = null;
        MockApp.onPost('/data/case-types/:caseType/validate', (req, res, next) => {
            validateReq = req;
            res.status(statusCode).send("Data validation error!");
        });
        await MockApp.stopServer();
        await MockApp.startServer();

        await caseEditPage.clickContinue();
        expect(await caseEditPage.isCallbackErrorSummaryDisplayed(), ' Error summary banner is not displayed').to.be.true;

    });


});