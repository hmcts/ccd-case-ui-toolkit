

const CucumberReportLogger = require('../support/reportLogger');

var { defineSupportCode } = require('cucumber');

const MockApp = require('../nodeMock/app');
const CCDCaseConfig = require('../nodeMock/ccd/ccdCaseConfig/caseCreateConfigGenerator');
const {getDateTimeTestEvent,getBlankEvent,addPageToEvent,addCaseField,setCaseFieldProps} = require('../mockData/caseEvent');
const caseEditPage = require('../pageObjects/ccdCaseEditPages')
const dateTimePickerComponent = require('../pageObjects/dateTimePicker');

defineSupportCode(function ({ And, But, Given, Then, When }) {

  
    Given('I create mock Case event {string}', function (moduleRef) {
        const mockCaseEvent = new CCDCaseConfig("Mock event ", "Mock jurisdiction", "test description " + moduleRef);
        global.scenarioData[moduleRef] = mockCaseEvent;
    });

    Given('I add page to event {string}', function (moduleRef,datatable) {
        const pageConfig = datatable.hashes()[0];
        const mockCaseEvent = global.scenarioData[moduleRef];

        mockCaseEvent.addWizardPage(pageConfig.id, pageConfig.label);
        global.scenarioData[pageConfig.reference] = mockCaseEvent.getWizardPageConfig(pageConfig.id);
    });

    Given('I add fields to page {string} in event {string}',function (pageRef,moduleRef, datatable) {
        const fieldConfigs = datatable.hashes();
        for (let i = 0; i < fieldConfigs.length; i++){
            const fieldConfig = fieldConfigs[i];
            const mockCaseEvent = global.scenarioData[moduleRef];
            const pageConfig = global.scenarioData[pageRef];

            const fieldStructure = fieldConfig.id.split(".");
            if (fieldStructure.length === 1){
                mockCaseEvent.addCCDFieldToPage(pageConfig, { id: fieldStructure[0], type: fieldConfig.type, label: fieldConfig.label });
            }else{
                let deepFieldConfig = mockCaseEvent.getCaseFieldConfig(fieldStructure[0]);
                for (let i = 1; i < fieldStructure.length -1; i++) {
                    if (deepFieldConfig.field_type.type === "Complex"){
                        deepFieldConfig = deepFieldConfig.field_type.complex_fields.filter(f => f.id === fieldStructure[i])[0];
                        if (!deepFieldConfig){
                            throw new Error(`${fieldStructure[i]} is not fiund in structure ${fieldConfig.id}`);
                        }
                    } else if (deepFieldConfig.field_type.type === "Collection"){
                        deepFieldConfig = deepFieldConfig.field_type.collection_field_type;
                        if (!deepFieldConfig) {
                            throw new Error(`${fieldStructure[i]} is not fiund in structure ${fieldConfig.id}`);
                        }
                    }

                }
                const fieldConfigToAdd = mockCaseEvent.getCCDFieldTemplateCopy({ id: fieldStructure[fieldStructure.length - 1], type: fieldConfig.type, label: fieldConfig.label });

                if (deepFieldConfig.field_type.type === "Complex") {
                    deepFieldConfig.field_type.complex_fields.push(fieldConfigToAdd);
                } else if (deepFieldConfig.field_type.type === "Collection") {
                    deepFieldConfig.field_type.collection_field_type = fieldConfigToAdd;
                }

            } 
        }
    });
        
        

    Given('I set field properties for field with id {string} in event {string}', function (fieldId, moduleRef, datatable){
        const mockCaseEvent = global.scenarioData[moduleRef];
        const fieldProps = datatable.hashes();
        const fieldpropsObj = {};
        for (let i = 0; i < fieldProps.length; i++){
            fieldpropsObj[fieldProps[i].key] = fieldProps[i].value;
            
        }
        mockCaseEvent.updateFieldProps(fieldId, fieldpropsObj);
        
    });

    Given('I set case event {string} in mock', function(eventRef){
        const mockCaseEvent = global.scenarioData[eventRef];
        // console.log(mockCaseEvent.getCase());
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

    Given('I setup blank event {string} ', function (eventRef) {
        const mockCaseEvent = getBlankEvent();
        global.scenarioData[eventRef] = mockCaseEvent;
        MockApp.onGet('/data/internal/case-types/:jurisdiction/event-triggers/:caseType', (req, res) => {
            res.send(mockCaseEvent.getCase());
        });

    });

    When('I enter case event field values for event {string}', async function (eventRef, fielValuesDT){
        const mockCaseEvent = global.scenarioData[eventRef] ;
        const fieldValues = fielValuesDT.hashes();
        for (let i = 0; i < fieldValues.length; i++) {
            const fieldConfig = mockCaseEvent.getCaseFieldConfig(fieldValues[i].fieldId);
            await caseEditPage.inputCaseField(fieldConfig, fieldValues[i].value, null)
        }
    });

    When('I validate datetime field values in case edit page', async function (fielValuesDT) {
        const fieldValues = fielValuesDT.hashes();
        for (let i = 0; i < fieldValues.length; i++) {
            const fieldVal = await dateTimePickerComponent.getFieldValue(fieldValues[i].fieldId, null)
            expect(fieldVal).to.equal(fieldValues[i].value)
        }

    });

    Given('I set complex field overrides for case field {string} in event {string}', async function (fieldId, eventRef, overrides){
        const mockCaseEvent = global.scenarioData[eventRef];
        const overridesHashes = overrides.hashes();
        mockCaseEvent.addComplexFieldOverridesToCaseField(fieldId, overridesHashes)


    });

    Given('I set caseField values in event config {string}', async function (eventRef, fields){
        const mockCaseEvent = global.scenarioData[eventRef];
        const fieldHashes = fields.hashes();
       
        for (let i = 0; i < fieldHashes.length; i++){
            mockCaseEvent.setCaseFieldValue(fieldHashes[i].id, fieldHashes[i].value);
        } 
    });

    Given('I set event default values for event {string}', async function (eventRef){
        const mockCaseEvent = global.scenarioData[eventRef];
        const caseFields = mockCaseEvent.getCase().case_fields;
        const eventData = {};
        for (let i = 0; i < caseFields.length; i++){
            eventData[caseFields[i].id] = mockCaseEvent.getCaseFieldDefaultValue(caseFields[i].id)
            caseFields[i].value = eventData[caseFields[i].id];
        } 
        console.log(JSON.stringify(eventData))
    });


});