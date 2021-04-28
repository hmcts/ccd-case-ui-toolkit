var { defineSupportCode } = require('cucumber');

const MockApp = require('../nodeMock/app');

// const browserUtil = require('../../util/browserUtil');
// const nodeAppMockData = require('../../../nodeMock/nodeApp/mockData');
const CucumberReporter = require('../support/reportLogger');
const dateTimePickerComponent = require('../pageObjects/dateTimePicker');
const CaseListConfig = require('../nodeMock/ccd/ccdCaseConfig/caseListConfigGenerator');

defineSupportCode(function ({ And, But, Given, Then, When }) {

    Given('I setup caselist mock {string}', async function (caselistMockRef) {
        const caseListConfig = new CaseListConfig();
        global.scenarioData[caselistMockRef] = caseListConfig;
       
    });

    Given('I add case field columns to caselist config {string}', async function (caselistMockRef, datatable){
        const caseListConfigGenerator = global.scenarioData[caselistMockRef];
        const caseColumnRowHashes = datatable.hashes();
        
        for (let i = 0; i < caseColumnRowHashes.length; i++){
            caseListConfigGenerator.addCaseField(caseColumnRowHashes[i]);
        }
        
    });

    Given('I add case field type props to caselist config {string}', async function (caselistMockRef ,datatable) {
        const caseListConfigGenerator = global.scenarioData[caselistMockRef];
        const caseFiledTypeRowHashes = datatable.hashes();

        for (let i = 0; i < caseFiledTypeRowHashes.length; i++) {
            const caseFieldId = caseFiledTypeRowHashes[i].case_field_id;
            delete caseFiledTypeRowHashes[i].case_field_id;
            caseListConfigGenerator.setCaseFieldTypeProps(caseFieldId, caseFiledTypeRowHashes[i]);
        }

    });

    Given('I add case list data rows for config {string}', async function (caselistMockRef, datatable){
        const caseListConfigGenerator = global.scenarioData[caselistMockRef];
        caseListConfigGenerator.addCaseData(datatable.hashes());
    });

    Given('I set mock case list config {string}', async function (caselistMockRef){
        const caseListConfigGenerator = global.scenarioData[caselistMockRef];
        MockApp.onPost('/data/internal/searchCases', (req, res) => {
            res.send(caseListConfigGenerator.getCaseListConfig());
        });
    });


});
