
const CCDCaseConfig = require('../nodeMock/ccd/ccdCaseConfig/caseCreateConfigGenerator');

const searchResultTemplate = {
    columns : [],
    results: [],
    total: 0
}

function getDatetimefieldsResults(){
    const searchResults = {
        columns: [],
        results: [],
        total: 0
    }
}

module.exports = { getEventTemplate, getDateTimeTestEvent }