

const CucumberReportLogger = require('../support/reportLogger');

var { defineSupportCode } = require('cucumber');

const MockApp = require('../nodeMock/app');

const {getDateTimeTestEvent} = require('../mockData/caseEvent');

defineSupportCode(function ({ And, But, Given, Then, When }) {

  
    Given('I create mock Case event {string}', function (moduleRef) {
        const mockCaseEvent = new CCDCaseConfig("Mock event ", "Mock jurisdiction", "test description " + moduleName);
        global.scenarioData[moduleRef] = mockCaseEvent;
    });

    Given('I add page to event {string}', function (moduleRef,datatable) {
        const pageConfig = datatable.hashes()[0];
        const mockCaseEvent = global.scenarioData[moduleRef];s

        mockCaseEvent.addWizardPage(pageConfig.id, pageConfig.label);
        global.scenarioData[pageConfig.reference] = mockCaseEvent.getWizardPageConfig(pageConfig.id);
    });

    Given('I add field to page {string} in event {string}',function (pageRef,moduleRef, datatable) {
        const fieldConfig = datatable.hashes()[0];
        const mockCaseEvent = global.scenarioData[moduleRef]; 
        const pageConfig = global.scenarioData[pageRef];

        mockCaseEvent.addCCDFieldToPage(pageConfig, { id: fieldConfig.id, type: fieldConfig.type, label: fieldConfig.label});
    });

    Given('I set field properties for field with id {string} in event {string}', function (fieldId, moduleRef, datatable){
        const fieldProps = datatable.hashes()[0];
        const mockCaseEvent = global.scenarioData[moduleRef];
        mockCaseEvent.updateFieldProps(fieldId, fieldProps);
    });

    Given('I set case event {string} in mock', function(eventRef){
        const mockCaseEvent = global.scenarioData[moduleRef];

        MockApp.onGet('/data/internal/case-types/:jurisdiction/event-triggers/:caseType', (req,res) => {
            res.send(mockCaseEvent.getCase());
        });
    });

    Given('I setup event {string} for Date time picker test', function(eventRef){
        const mockCaseEvent = getDateTimeTestEvent() ;
        global.scenarioData[eventRef] = mockCaseEvent;
        MockApp.onGet('/data/internal/case-types/:jurisdiction/event-triggers/:caseType', (req, res) => {
            res.send(mockCaseEvent.getCase());
        });

    });

});