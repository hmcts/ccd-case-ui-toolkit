
const CCDCaseConfig = require('../nodeMock/ccd/ccdCaseConfig/caseCreateConfigGenerator');


function getEventTemplate(){
    return new CCDCaseConfig("Moctestevent", "MockTestJurisdiction", "Mock test event description");

}

function getBlankEvent(){
    const eventConfig = getEventTemplate();
    return eventConfig;
}

function addPageToEvent(event, pageId, PageHeader) {
    event.addWizardPage(pageId, PageHeader)
    return event;
}

function addCaseField(event, fieldConfig) {
    event.addCaseField(fieldConfig)
    return event;
}

function setCaseFieldProps(event, fieldId, fieldProps) {

    event.setFieldProps(fieldProps)
    return event;
}

function getDateTimeTestEvent(){
    const eventConfig = getEventTemplate();
    eventConfig.addWizardPage("dateTimeFieldsPage", "Date time fields test page")
    .addCaseField({ id : "dateField", type: "Date", label:  "Date only" })
    .addCaseField({ id: "dateTimeField", type: "DateTime", label: "Date and time" })
    return eventConfig;
}

function getDateTimeInComplexTestEvent() {
    const eventConfig = getEventTemplate();
    eventConfig.addWizardPage("dateTimeFieldsPage", "Date time fields test page")
        .addCaseField({ id: "complexfield", type: "Complex", label: "Complex field of Date" })

    const DateField = eventConfig.getCCDFieldTemplateCopy({ id: "dateField", type: "Date", label: "Date only" });
    DateField.display_context_parameter = "#test(YYYY YYYY YY),#DATETIMEDISPLAY(YYYY-MM),#DATETIMEENTRY(YYYY-MM-DD)";
    DateField.value = "2021-02-13T09:30:55.15";

    eventConfig.getCaseFieldConfig("complexfield").field_type.complex_fields.push(DateField);

    return eventConfig;
}


module.exports = { getEventTemplate, getDateTimeTestEvent, getDateTimeInComplexTestEvent, getBlankEvent, addPageToEvent, addCaseField, setCaseFieldProps}
