var { defineSupportCode } = require('cucumber');

const MockApp = require('../nodeMock/app');

// const browserUtil = require('../../util/browserUtil');
// const nodeAppMockData = require('../../../nodeMock/nodeApp/mockData');
const CucumberReporter = require('../support/reportLogger');
const dateTimePickerComponent = require('../pageObjects/dateTimePicker');
const WorkbasketConfig = require('../nodeMock/ccd/ccdCaseConfig/workBasketInputGenerator');
const caseListFilters = require('../pageObjects/caseListFilters');
const SoftAssert = require('../support/softAssert');

defineSupportCode(function ({ And, But, Given, Then, When }) {

    Given('I setup workbasket mock {string}', async function (workbasketMockRef) {
        const workBasketConfig = new WorkbasketConfig();
        global.scenarioData[workbasketMockRef] = workBasketConfig;

    });

    Given('I add case field to workbasket config {string}', async function (workbasketConfigref, datatable) {
        const workbasketConfig = global.scenarioData[workbasketConfigref];
        const caseFieldRowHashes = datatable.hashes();

        for (let i = 0; i < caseFieldRowHashes.length; i++) {
            workbasketConfig.addField(caseFieldRowHashes[i]);
        }

    });

  

    Given('I set mock workbasket config {string}', async function (workbasketConfigref) {
        const workbasketConfig = global.scenarioData[workbasketConfigref];
        MockApp.onGet('/data/internal/case-types/:jurisdiction/work-basket-inputs', (req, res) => {
            res.send(workbasketConfig.getConfig());
        });
    });

    Given('I select jurisdiction in case list filters', async function(){
        await caseListFilters.selectAnyJurisdiction();
    });

    Given('I select case type in case list filters', async function () {
        await caseListFilters.selectAnyCaseType();
    });

    Then('I validate workbasket filters displayed', async function(datatable){
        const softAssert = new SoftAssert();
        const cssHashes = datatable.hashes();
        for(let i = 0; i < cssHashes.length; i++){
            softAssert.setScenario(`field with css ${cssHashes[i].cssSelector}`)
            await softAssert.assert(async () => expect(await caseListFilters.isFilterWithcssDisplayed(cssHashes[i].cssSelector),`field not displayed`).to.be.true)
        }
        softAssert.finally();
    });

    When('I set date time picker value for fields in workbasket', async function(datatable){
        const fields = datatable.hashes();
        for (let i = 0; i < fields.length; i++) {
            await caseListFilters.openDateTimePickerForFieldWithId(fields[i].fieldId);
            await caseListFilters.setDatetimeField(fields[i].value);
  
        }
    });
  
    Then('I validate date time picker field values in workbasket', async function(datatable){
        const softAssert = new SoftAssert();
        const fields = datatable.hashes();
        for (let i = 0; i < fields.length; i++) {
           
            softAssert.setScenario(`field with id ${fields[i].fieldId}`)
            await softAssert.assert(async () => expect(await caseListFilters.getDateTimeFieldValueWithId(fields[i].fieldId), `field value mismatch`).to.equal(fields[i].value))
        }
        softAssert.finally()
    });


});
