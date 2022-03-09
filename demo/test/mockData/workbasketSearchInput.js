
const CCDWorkbasketConfig = require('../nodeMock/ccd/ccdCaseConfig/workBasketInputGenerator');
const CCDSearchInputConfig = require('../nodeMock/ccd/ccdCaseConfig/searchInputGenerator');

function getMockJurisdictionWorkbaseketConfig() {
    const workBasketConfig = new CCDWorkbasketConfig();
    workBasketConfig
        .addField({ id: "simpletext", type: "Text", label: "Simple text input" })
        .addField({ id: "radioInput", type: "FixedRadioList", label: "Simple Radio input", list: [{ code: "a", label: "A" }, { code: "b", label: "B" }, { code: "c", label: "C" }] })
        .addField({ id: "radioYesorNo", type: "YesOrNo", label: "Simple Yes or No input" })
        .addField({ id: "fixedListItem", type: "FixedList", label: "fixed listinput", list: [{ code: "a", label: "A" }, { code: "b", label: "B" }, { code: "c", label: "C" }] })
        .addField({ id: "multiSelectItem", type: "MultiSelectList", label: "Multi select input", list: [{ code: "a", label: "A" }, { code: "b", label: "B" }, { code: "c", label: "C" }] })

        .getConfig();
    return workBasketConfig;
}

function getConfigWithDate(fieldId) {
    const workBasketConfig = new CCDWorkbasketConfig();
    workBasketConfig
        .addField({ id:  "dateField", type: "Date", label: "Date field", "display_context_parameter": "#DATETIMEENTRY(YYYY-MM)" })
    
        .addField({ id:  "dateTimeField", type: "DateTime", label: "Date time field", "display_context_parameter": "#DATETIMEENTRY(YYYY-MM-DD hh:mm:ss)"  })
        .getConfig();
    return workBasketConfig;
}

module.exports = { getMockJurisdictionWorkbaseketConfig, getConfigWithDate }