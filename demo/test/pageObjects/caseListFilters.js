const BrowserWaits = require('../support/customWaits');
const reportLogger = require('../support/reportLogger');
const dateTimePicker = require('./dateTimePicker');
class CaseListPage {

    pageContainer = $('ccd-case-list-filters');
    applyBtn = element(by.xpath("//ccd-case-list-filters //button[text()= 'Apply']"));
    resetBtn = element(by.xpath("//ccd-case-list-filters //button[text()= 'Reset']"));
    async amOnPage() {
        try {
            await BrowserWaits.waitForElement(this.pageContainer);
            return true;
        } catch (error) {
            reportLogger.AddMessage("Error waiting for case list page " + error);
            return false;
        }
    }

    async selectAnyJurisdiction(){
        await $('ccd-case-list-filters #wb-jurisdiction option:nth-of-type(2)').click();
    }

    async selectAnyCaseType() {
        await $('ccd-case-list-filters #wb-case-type option:nth-of-type(2)').click();
    }

    async isFilterWithcssDisplayed(css){
        return await this.pageContainer.$(`${css}`).isDisplayed();
    }

    async openDateTimePickerForFieldWithId(id){
        await dateTimePicker.openDateTimePicker(`ccd-case-list-filters #${id}`);
    }

    async setDatetimeField(value) {
        await dateTimePicker.setDateTime(value);
    }

    async getDateTimeFieldValueWithId(id){
        return await dateTimePicker.getFieldValue(`ccd-case-list-filters #${id}`);
    }

    async clickApplyBtn(){
        await this.applyBtn.click();
    }


}

module.exports = new CaseListPage();
