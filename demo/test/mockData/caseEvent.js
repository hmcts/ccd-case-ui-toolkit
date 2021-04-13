
const CCDCaseConfig = require('../nodeMock/ccd/ccdCaseConfig/caseCreateConfigGenerator');


function getEventTemplate(){
    return new CCDCaseConfig("Moctestevent", "MockTestJurisdiction", "Mock test event description");

}


function getDateTimeTestEvent(){
    const eventConfig = getEventTemplate();
    eventConfig.addWizardPage("dateTimeFieldsPage", "Date time fields test page")
    .addCaseField({ id : "dateField", type: "Date", label:  "Date only" })
        .setFieldProps({ display_context_parameter: "#test(YYYY YYYY YY),#DATETIMEDISPLAY(YYYY-MM),#DATETIMEENTRY(YYYY-MM-DD)"})
    // .addCaseField({ id: "dateTimeField", type: "DateTime", label: "Date and time" })
    //     .setFieldProps({ display_context_parameter: "#DATETIMEENTRY(YYYY)" })
    return eventConfig;
}

function getDateTimeInComplexTestEvent() {
    const eventConfig = getEventTemplate();
    eventConfig.addWizardPage("dateTimeFieldsPage", "Date time fields test page")
        .addCaseField({ id: "complexfield", type: "Complex", label: "Complex field of Date" })
      
    const DateField = eventConfig.getCCDFieldTemplateCopy({ id: "dateField", type: "Date", label: "Date only" });
    // DateField.display_context = "READONLY";
    DateField.display_context_parameter = "#test(YYYY YYYY YY),#DATETIMEDISPLAY(YYYY-MM),#DATETIMEENTRY(YYYY-MM-DD)";
    DateField.value = "2021-02-13T09:30:55.15";

    eventConfig.getCaseFieldConfig("complexfield").field_type.complex_fields.push(DateField);

    return eventConfig;
}


module.exports = { getEventTemplate, getDateTimeTestEvent, getDateTimeInComplexTestEvent }