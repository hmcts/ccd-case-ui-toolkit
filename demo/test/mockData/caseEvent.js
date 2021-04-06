
const CCDCaseConfig = require('../nodeMock/ccd/ccdCaseConfig/caseCreateConfigGenerator');


function getEventTemplate(){
    return new CCDCaseConfig("Moctestevent", "MockTestJurisdiction", "Mock test event description");

}


function getDateTimeTestEvent(){
    const eventConfig = getEventTemplate();
    eventConfig.addWizardPage("dateTimeFieldsPage", "Date time fields test page")
    .addCaseField({ id : "dateField", type: "Date", label:  "Date only" })
    .addCaseField({ id: "dateTimeField", type: "DateTime", label: "Date and time" })
    return eventConfig;
}

module.exports = { getEventTemplate, getDateTimeTestEvent }