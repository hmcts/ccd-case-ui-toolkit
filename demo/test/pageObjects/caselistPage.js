const BrowserWaits = require('../support/customWaits');
const BrowserUtil = require('../support/browserUtil');
const reportLogger = require('../support/reportLogger');

class CaseListPage{

    pageContainer = $('exui-case-list');
    dynamicFiltersContainer = $('#dynamicFilters');
    applyBtnWorkbasketFilters = $('ccd-workbasket-filters button:not(.button-secondary)');
    resetBtnWorkbasketFilters = $('ccd-workbasket-filters button.button-secondary]');
    caseListTableHead = $("ccd-search-result>table>thead tr th");
    caseListTableTr = $$("ccd-search-result>table>tbody>tr");
    caseResultsPagination = $('ccd-search-result .pagination-top');

    async amOnPage(){
        try{
            await BrowserWaits.waitForElement(this.pageContainer); 
            return true;
        }catch(error){
            reportLogger.AddMessage("Error waiting for case list page "+error);
            return false;
        }
    }

    async getColumnValues(columnLabel){
        const colPos = await this.getColumnDisplayPosition(columnLabel);
        if (colPos === -1){
            throw new Error(`Test error, col with label ${columnLabel} not found`);
        }
        const dataRows = $$(`ccd-search-result > table > tbody > tr`);
        const rowsCount = await dataRows.count();
        const columnValues = [];
        for (let i = 1; i <= rowsCount; i++){
            const rowColVal = await $(`ccd-search-result tr:nth-of-type(${i}) .search-result-column-cell:nth-of-type(${colPos})`).getText();
            columnValues.push(rowColVal);

        }
        return columnValues ;

    }

    async getColumnDisplayPosition(columnLabel){
        const columnHeaders = $$('ccd-search-result thead th');
        const columnsCount = await columnHeaders.count();
        for (let i = 1; i <= columnsCount; i++){
            const columnHeader = await columnHeaders.get(i - 1);
            await BrowserUtil.scrollToElement(columnHeader);
            const thisColLabel = await columnHeader.$('.search-result-column-label').getText();
            if (thisColLabel === columnLabel){
                return i;
            }
        }
        return -1;
    }


}

module.exports = new CaseListPage();
