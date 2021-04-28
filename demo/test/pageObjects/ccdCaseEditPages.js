const BrowserWaits = require('../support/customWaits');
const reportLogger = require('../support/reportLogger');

// const SoftAssert = require('../../util/softAssert');
const date = require('moment');

const dateTimePicker = require('./dateTimePicker');
class CaseEdit {

    checkYourAnswersPageElement = $(".check-your-answers");
    continueBtn = $('ccd-case-edit .form > .form-group button[type = "submit"]');
    previousBtnInEditPage = $('ccd-case-edit .form > .form-group button.button-secondary');
    cancelLinkInEditPage = $('ccd-case-edit .form .cancel a');

    submitBtn = $('ccd-case-edit-submit form > .form-group button[type = "submit"]');
    previousBtnInSubmitPage = $('ccd-case-edit-submit form > .form-group button.button-secondary');
    cancelLinkInSubmitPage = $('ccd-case-edit-submit form .cancel a')

    checkYourAnswersHeading = $('.check-your-answers>.heading-h2');
    checkYourAnswersHeadingDescription = $('.check-your-answers>span');

    checkYourAnswersSummaryRows = $$('.check-your-answers .form-table tr');

    errorSummaryContainer = $('.error-summary');

    async waitForPage() {
        await BrowserWaits.waitForElement($('ccd-case-edit-page'));
    }

    async amOnPage(){
        try{
            await this.waitForPage();
            return true; 
        }catch(error){
            reportLogger.AddMessage("Error waiting for case edit page :" +error);
            return false;
        }
    }

    async isErrorSummaryDisplayed(){
        try {
            await BrowserWaits.waitForElement(this.errorSummaryContainer);
            return true;
        } catch (error) {
            reportLogger.AddMessage("Error waiting for case edit page :" + error);
            return false;
        }
    }


    async getPageTitle(){
        return await $('ccd-case-edit-page h1').getText();
    }

    async waitForField(caseFieldId) {
        await BrowserWaits.waitForElement($('#' + caseFieldId));
    }

    async isFieldDisplayed(fieldConfig) {
        let fieldId = null;
        if (fieldConfig.field_type.type === "Complex") {
            fieldId = fieldConfig.id + "_" + fieldConfig.id
        } else {
            fieldId = fieldConfig.id
        }
        const fieldIsPresent = await $('#' + fieldId).isPresent();
        if (!fieldIsPresent) {
            return fieldIsPresent;
        }
        return await $('#' + fieldId).isDisplayed();
    }

    async isFieldPresent(fieldConfig) {
        let fieldId = null;
        if (fieldConfig.field_type.type === "Complex") {
            fieldId = fieldConfig.id + "_" + fieldConfig.id
        } else {
            fieldId = fieldConfig.id
        }
        return await $('#' + fieldId).isPresent()
    }

    async getFieldLabel(caseFieldId) {
        let fieldElement = element(by.xpath(`//*[@id="${caseFieldId}"]`));
        let fieldTagName = "";
        do {
            fieldElement = fieldElement.element(by.xpath(".."));
            fieldTagName = await fieldElement.getTagName();
        } while (fieldTagName !== "ccd-field-write");

        const fieldLabel = fieldElement.element(by.xpath('//*[contains(@class, "form-label")]')).getText();
        return fieldLabel;
    }

    getFieldId(fieldId, parentId) {
        let domId = null;
        if (parentId) {
            domId = parentId + "_" + fieldId;
        }
        else {
            domId = fieldId;
        }
        return domId;
    }

    getComplexFieldId(fieldId, parentId) {
        let domId = null;
        if (parentId) {
            domId = parentId + "_" + fieldId + "_" + fieldId;
        }
        else {
            domId = fieldId + "_" + fieldId;
        }
        return domId;
    }

    

    async inputTextField(fieldConfig, inputtext, cssSelector) {
        let inputValue = null;
        if (inputtext) {
            inputValue = inputtext;
        } else {
            inputValue = fieldConfig.label ? fieldConfig.label + "Test" : fieldConfig.id + " Test";
        }

        await $(`${cssSelector}`).clear();
        await $(`${cssSelector}`).sendKeys(inputValue);
        return inputValue;
    }

    async inputPostCode(fieldConfig, value, cssSelector) {
        // await ccdField.$('.form-control').sendKeys("SW1");
        // await ccdField.$('button').click();
        // var addressSelectionField = ccdField.$('select.form-control')
        // await BrowserWaits.waitForElement(addressSelectionField);
        // var addressToSelect = addressSelectionField.$("option:nth-of-type(2)");
        // await BrowserWaits.waitForElement(addressToSelect);
        // await addressToSelect.click()
        let inputValue = null;
        if (value) {
            inputValue = value;
        } else {
            inputValue = "SW20 9DJ";
        }

        await $(`${cssSelector}`).clear();
        await $(`${cssSelector}`).sendKeys(inputValue);
        return inputValue;
    }

    async inputNumberField(fieldConfig, inputNumber, cssSelector) {
        let inputValue = null;
        if (inputNumber) {
            inputValue = inputNumber;
        } else {
            inputValue = 12345;
        }
        await $(`${cssSelector}`).sendKeys(inputValue);
        return inputValue.toString();
    }

    async inputYesOrNoField(fieldConfig, inputOption, cssSelector) {

        let inputoptionId = null;
        if (inputOption) {
            inputoptionId = "-" + inputOption;
        } else {
            inputoptionId ="-Yes";
        }

        await $(`${cssSelector}${inputoptionId}`).click();
        // return inputoptionId.includes("Yes");
        return "Yes";
    }

    async inputFixedRadioListField(fieldConfig, inputOption, cssSelector) {

        let inputoptionId = null;
        let selectedVal = null;
        if (inputOption) {
            inputoptionId = inputOption;
        } else {
            selectedVal = fieldConfig.field_type.fixed_list_items[0];
            inputoptionId = selectedVal;
        }
        await $(`${cssSelector}-${inputoptionId.code}`).click();

        return inputoptionId;
    }

    async inputFixedListField(fieldConfig, inputOption, cssSelector) {

        let inputoptionId = null;
        let selectedVal = null;
        if (inputOption) {
            selectedVal = inputOption;
        } else {
            selectedVal = fieldConfig.field_type.fixed_list_items[0];
        }
        await $(`${cssSelector} option[ng-reflect-ng-value="${selectedVal.code}"]`).click();
        return selectedVal;
    }


    async inputMultiSelectListField(fieldConfig, inputOptions, cssSelector) {
        let inputoptionId = [];
        let selectedVal = [];
        if (inputOptions) {
            selectedVal = inputOptions;
        } else {
            selectedVal = fieldConfig.field_type.fixed_list_items;
        }
        for (const option of selectedVal) {

            await $(`${cssSelector}-${option.code}`).click();

        }
        return selectedVal;
    }

    async inputEmailField(fieldConfig, email, cssSelector) {
        let inputEmail = null;
        if (email) {
            inputEmail = fieldConfig.id + "-" + inputOption;
        } else {
            inputEmail = "test@test.com";
        }
        await $(`${cssSelector}`).sendKeys(inputEmail);
        return inputEmail
    }

    async inputComplexField(fieldConfig, value, parentid) {
        let fieldValue = {}

        if (fieldConfig.field_type.id === "AddressGlobalUK" || fieldConfig.field_type.id === "AddressUK") {
            return await this.inputaddressGlobalUK(fieldConfig, value, parentid);
        }

        if (fieldConfig.field_type.id === "AddressGlobalUK") {
            return await inputOrganisationField(fieldConfig, value, parentid);
        }

        let thisFieldId = null;
        if (parentid) {
            thisFieldId = parentid + "_" + fieldConfig.id;
        }
        else {
            thisFieldId = fieldConfig.id;
        };
        for (const complexFiedlConfig of fieldConfig.field_type.complex_fields) {
            fieldValue[complexFiedlConfig.id] = await this.inputCaseField(complexFiedlConfig, value ? value[complexFiedlConfig.id] : null, thisFieldId);
        }
        return fieldValue;
    }

    async inputaddressGlobalUK(fieldConfig, value, parentid) {
        // await BrowserWaits.waitForSeconds(600);
        // let thisFieldId = this.getFieldId(`${fieldConfig.id}_${fieldConfig.id}`, parentid);

        let fieldValue = {};
        let complexId ='';
        if(parentid == undefined) complexId = `${fieldConfig.id}_${fieldConfig.id}`;
        if(parentid) complexId = `${parentid}_${fieldConfig.id}_${fieldConfig.id}`;
        let postCodeInput=$(`#${complexId} #postcodeLookup input`);

        const postCodeFindAddressBtn = $(`#${complexId} #postcodeLookup button`);
        const postCodeAddressSelect = $(`#${complexId} #selectAddress select`);
        const postCodeAddressSelectOption = $(`#${complexId} #selectAddress select option:nth-of-type(2)`);

        await postCodeInput.sendKeys('sw1');
        await postCodeFindAddressBtn.click();
        await BrowserWaits.waitForElement(postCodeAddressSelect);
        await BrowserWaits.waitForElement(postCodeAddressSelectOption);
        await postCodeAddressSelectOption.click();

        await BrowserWaits.waitForSeconds(2);

        for (const complexFiedlConfig of fieldConfig.field_type.complex_fields) {
            let p_id = parentid ? parentid+"_"+fieldConfig.id : fieldConfig.id;
            let value = await $(`#${this.getFieldId(complexFiedlConfig.id, p_id)}`).getAttribute("value");
            fieldValue[complexFiedlConfig.id] = value;
        }

        return fieldValue;
    }

    async inputOrganisationField(fieldConfig, value, parentid) {
        const searchOrgInputText = $(`#${fieldConfig.id}_${fieldConfig.id} #search-org-text`);
        const orgResults = $$(`#${fieldConfig.id}_${fieldConfig.id} .scroll-container .td-select`);

        const organisationId = $(`#${fieldConfig.id}_${fieldConfig.id} ccd-write-organisation-complex-field input[@name = 'organisationID']`);
        const organisationName = $(`#${fieldConfig.id}_${fieldConfig.id} ccd-write-organisation-complex-field input[@name = 'organisationName']`);

        await searchOrgInputText.sendKeys("test");
        await BrowserWaits.waitForElement(orgResults);
        await orgResults.get(1).click();

        let fieldValue = {};
        fieldValue['organisationID'] = await organisationId.getAttribute("value");
        fieldValue['organisationName'] = await organisationName.getAttribute("value");
        return fieldValue;
    }
    async inputPhoneUKField(fieldConfig, inputPhone, cssSelector) {
        let inputPhoneNumber = null;
        if (inputPhone) {
            inputPhoneNumber = inputPhone;
        } else {
            inputPhoneNumber = "07123456789";
        }
        await $(`${cssSelector}`).sendKeys(inputPhoneNumber);
        return inputPhoneNumber.toString();
    }

    async inputMoneyGBP(fieldConfig, moneyVal, cssSelector) {
        let moneyGBPVal = null;
        if (moneyVal) {
            moneyGBPVal = moneyVal;
        } else {
            moneyGBPVal = 10000;
        }
        await $(`${cssSelector}`).sendKeys(moneyGBPVal);
        return moneyGBPVal*100+"";
    }

    async inputDate(fieldConfig, dateVal, cssSelector) {
        let inputDate = null;
        if (dateVal) {
            inputDate = dateVal;
        } else {
            inputDate = date().format('YYYY-MM-DD');
        }

        if (fieldConfig.display_context_parameter.includes("DATETIMEENTRY")){
            await dateTimePicker.openDateTimePicker(cssSelector);
            await dateTimePicker.setDateTime(inputDate);
            console.log(await dateTimePicker.getFieldValue(cssSelector));

        }else{
            let datesValues = inputDate.split('-');
            await $(`${cssSelector}-day`).sendKeys(datesValues[2]);
            await $(`${cssSelector}-month`).sendKeys(datesValues[1]);
            await $(`${cssSelector}-year`).sendKeys(datesValues[0]);

        }
        return inputDate;
    }

    async inputDateTime(fieldConfig, dateVal, cssSelector) {
        let inputDate = null;
        if (dateVal) {
            inputDate = dateVal;
        } else {
            inputDate = date().format('YYYY-MM-DD');
        }

        if (fieldConfig.display_context_parameter.includes("DATETIMEENTRY")) { 
            await dateTimePicker.openDateTimePicker(cssSelector);
            await dateTimePicker.setDateTime(inputDate);
            console.log("input set val " + await dateTimePicker.getFieldValue(cssSelector));
            inputDate = await dateTimePicker.getFieldValue(cssSelector);
        } else {
            let datesValues = inputDate.split('-');
            await $(`${cssSelector}-day`).sendKeys(datesValues[2]);
            await $(`${cssSelector}-month`).sendKeys(datesValues[1]);
            await $(`${cssSelector}-year`).sendKeys(datesValues[0]);

            await $(`${cssSelector}-hour`).sendKeys("02");
            await $(`${cssSelector}-minute`).sendKeys("30");
            await $(`${cssSelector}-second`).sendKeys("45");
            inputDate = `${inputDate}T02:30:45.000`;
        } 
        return inputDate;
    }

    async clickAddNewCollectionItemBtn(caseFieldConfig, fieldPathArr){
        const collectionFieldId = this.getInputFieldId(caseFieldConfig, fieldPathArr.split("."));
        const collectionAddBtn = $(`#${collectionFieldId} > div > button`);
        await collectionAddBtn.click();
    }

    async getSummaryPageDisplayElements() {
        await this.waitForChecYourAnswersPage();
        const isHeadingPresent = await this.checkYourAnswersHeading.isPresent();
        const isHeadingDescPresent = await this.checkYourAnswersHeadingDescription.isPresent();
        const summaryRowsCount = await this.checkYourAnswersSummaryRows.count();
        return { header: isHeadingPresent, headerDescription: isHeadingDescPresent, rows: summaryRowsCount }
    }

    async isCancelLinkInEditpageDisplayed() {
        await this.waitForPage();
        await browser.executeScript('arguments[0].scrollIntoView()', this.cancelLinkInEditPage);
        return await this.cancelLinkInEditPage.isDisplayed();
    }

    async clickCancelLinkInEditPage() {
        expect(await this.amOnPage(),"Not in case edit page").to.be.true;
        return await this.cancelLinkInEditPage.click();
    }

    async isCancelLinkInSubmitPageDisplayed() {
        await this.waitForPage();
        return await this.cancelLinkInSubmitPage.isDisplayed();
    }

    async clickCancelLinkInSubmitPage() {
        await this.waitForPage();
        return await this.cancelLinkInSubmitPage.click();
    }


    async isPreviousBtnInEditpageDisplayed() {
        await this.waitForPage();
        return await this.previousBtnInEditPage.isDisplayed();
    }

    async clickPreviousBtnInEditPage() {
        await this.waitForPage();
        return await this.previousBtnInEditPage.click();
    }

    async isPreviousBtnInSubmitPageDisplayed() {
        await this.waitForPage();
        return await this.previousBtnInSubmitPage.isDisplayed();
    }

    async clickPreviousBtnLinkInSubmitPage() {
        await this.waitForPage();
        return await this.previousBtnInSubmitPage.click();
    }


    getSubmitButton() {
        return this.submitBtn;
    }

    async clickSubmit() {
        await BrowserWaits.waitForElement(this.submitBtn);
        await browser.executeScript('arguments[0].scrollIntoView()',
            this.submitBtn)
        await this.submitBtn.click();
    }

    async selectRadioYesOrNo(fieldId, value) {
        let toSelect = value ? 'Yes' : 'No';
        let inputToSelect = $(`#${fieldId} input[id$='${toSelect}']`);
        await inputToSelect.click();
    }

    async clickContinue() {
        // await BrowserWaits.waitForElement(this.continueBtn);
        // await this.continueBtn.click();
        var continieElement = element(by.xpath('//button[@type= "submit"]'));
            await browser.executeScript('arguments[0].scrollIntoView()',
                continieElement.getWebElement())

            await BrowserWaits.waitForElement(continieElement);
            await BrowserWaits.waitForElementClickable(continieElement);

            var thisPageUrl = await browser.getCurrentUrl();
            console.log("Submitting : " + thisPageUrl )
            await continieElement.click();
    }

    async waitForChecYourAnswersPage() {
        await BrowserWaits.waitForElement(this.checkYourAnswersPageElement);

    }

    async isCheckYourAnswersPagePresent() {
        return await this.checkYourAnswersPageElement.isPresent();
    }

    async inputCaseField(fieldConfig, value, cssSelector) {
       
        // const inputFieldPathArr = inputFieldPath.split(".");
        // const fieldConfig = this.getInputFieldConfig(caseFieldConfig, inputFieldPathArr);
        // const inputFieldId = this.getInputFieldId(caseFieldConfig, inputFieldPathArr);
        // await BrowserWaits.waitForSeconds(1);
        // console.log(`******** input : parentId ${parentId} , value ${value}, fieldId ${fieldConfig.id}`);
        let fieldValue = null;
        const fieldType = fieldConfig.field_type ? fieldConfig.field_type.type : fieldConfig.type;
        switch (fieldType) {
            case "Text":
            case "TextArea":
                fieldValue = await this.inputTextField(fieldConfig, value, cssSelector);
                break;
            case "Postcode":
                fieldValue = await this.inputPostCode(fieldConfig, value, cssSelector);
                break;
            case "Number":
                fieldValue = await this.inputNumberField(fieldConfig, value, cssSelector);
                break;
            case "YesOrNo":
                fieldValue = await this.inputYesOrNoField(fieldConfig, value, cssSelector);
                break;
            case "Email":
                fieldValue = await this.inputEmailField(fieldConfig, value, cssSelector);
                break;
            case "Complex":
                fieldValue = await this.inputComplexField(fieldConfig, value, cssSelector);
                break;
            case "FixedRadioList":
                fieldValue = await this.inputFixedRadioListField(fieldConfig, value, cssSelector);
                fieldValue = fieldValue.code
                break;
            case "FixedList":
                fieldValue = await this.inputFixedListField(fieldConfig, value, cssSelector);
                fieldValue = fieldValue.code
                break;
            case "MultiSelectList":
                const multiSelectVal = await this.inputMultiSelectListField(fieldConfig, value, cssSelector);
                const fieldValues = [];
                for (const val of multiSelectVal){
                    fieldValues.push(val.code);
                }
                fieldValue = fieldValues; 
                break;
            case "PhoneUK":
                fieldValue = await this.inputPhoneUKField(fieldConfig, value, cssSelector);
                break;
            case "MoneyGBP":
                fieldValue = await this.inputMoneyGBP(fieldConfig, value, cssSelector);
                break;
            case "Date":
                fieldValue = await this.inputDate(fieldConfig, value, cssSelector);
                break;
            case "DateTime":
                fieldValue = await this.inputDateTime(fieldConfig, value, cssSelector);
                break;
        }
        reportLogger.AddMessage("Field set value for " + fieldType)
        reportLogger.AddJson(JSON.stringify(fieldValue))

        return fieldValue;
    }


    isPathArrFieldCollection(field) {
        const pathFiedlProps = { isColl: false, fieldId: null, arrNum: null }
        const arrText = field.match(/\[([^\][]*)]/g)
        if (arrText) {
            pathFiedlProps.isColl = true;
            const arrNum = arrText[0].match(/([0-9]+)/g)
            pathFiedlProps.arrNum = arrNum;
            pathFiedlProps.fieldId = field.replace(arrText[0], "");
        } else {
            pathFiedlProps.fieldId = field;
        }
        return pathFiedlProps;
    }
    getInputFieldId(fieldConfig, pathArray) {

        let fieldId = null;
        const thisFieldId = pathArray[0];
        const collectionFieldArr = this.isPathArrFieldCollection(thisFieldId);
        const immediateChildId = pathArray.length > 1 ? pathArray[1] : null;

        const fieldType = fieldConfig.field_type ? fieldConfig.field_type.type : fieldConfig.type;

        if (fieldType === "Complex") {

            if (immediateChildId) {
                const childFieldConfig = fieldConfig.field_type.complex_fields.filter(child => child.id === immediateChildId)[0];
                const grandChildAndSuccessorIds = pathArray.slice((pathArray.length - 1) * -1)
                if (fieldConfig.field_type){
                    fieldId = `${fieldConfig.id}_${this.getInputFieldId(childFieldConfig, grandChildAndSuccessorIds)}`
                }else{
                    fieldId = `${this.getInputFieldId(childFieldConfig, grandChildAndSuccessorIds)}`
                }
                
            } else {
                if (fieldConfig.field_type) {
                    fieldId = `${fieldConfig.id}_`
                }
               
            }
        } else if (fieldType === "Collection") {
            if (immediateChildId) {
                const arrNum = collectionFieldArr.arrNum ? collectionFieldArr.arrNum : 0;
                const childFieldConfig = fieldConfig.field_type.collection_field_type;
                const grandChildAndSuccessorIds = pathArray.slice((pathArray.length - 1) * -1)
                const childId = this.getInputFieldId(childFieldConfig, grandChildAndSuccessorIds);
                if (childId === "value"){
                    fieldId = `${fieldConfig.id}_${this.getInputFieldId(childFieldConfig, grandChildAndSuccessorIds)}`
                }else{
                    fieldId = `${fieldConfig.id}_${arrNum}_${this.getInputFieldId(childFieldConfig, grandChildAndSuccessorIds)}`
                }
                
            } else {
                fieldId = `${fieldConfig.id}`
            }            
        } else {
            if (fieldConfig.field_type) {
                fieldId = `${fieldConfig.id}`
            }else{
                fieldId = "value"
            }
            
        }
        reportLogger.AddMessage(`${fieldConfig.id} field and child path ${pathArray} cssSelector : ${fieldId}`)
        return fieldId;
    }

    async validateCheckYourAnswersPage(eventConfig){
        const softAssert = new SoftAssert();
        softAssert.setScenario("Check yours answers page content");
        await softAssert.assert(async () => expect(await this.isCheckYourAnswersPagePresent(), "Not on check your answers page").to.be.true );
        
        const isHeadingPresent = await this.checkYourAnswersHeading.isPresent();
        const isHeadingDescPresent = await this.checkYourAnswersHeadingDescription.isPresent();
        const summaryRowsCount = await this.checkYourAnswersSummaryRows.count()
        if (eventConfig.show_summary) {
            await softAssert.assert(async() => expect(isHeadingPresent, "Check your answers header text not displayed").to.be.true);
            await softAssert.assert(async() => expect(isHeadingDescPresent, "Check your answers header description text not displayed").to.be.true);
            await softAssert.assert(async() => expect(summaryRowsCount, "Check your answers summary rows count is 0").to.be.above(0));
        } else {
            await softAssert.assert(async() => expect(isHeadingPresent, "Check your answers header text displayed").to.be.false);
            await softAssert.assert(async() => expect(isHeadingDescPresent, "Check your answers header description text displayed").to.be.false);
            await softAssert.assert(async() => expect(summaryRowsCount, "Check your answers summary rows count is not 0").to.equal(0));
        }

        for (const caseField of eventConfig.case_fields){
            softAssert.setScenario(`"${caseField.label}" Field display for condition show_summary_change_option value "${caseField.show_summary_change_option}" validation`);
            const fieldHeader = element(by.xpath(`//ccd-case-edit-submit//*[contains(@class, "form-table")]//tr//th//span[text() = "${caseField.label}"]`))
            const isFieldExpectedToDisplay = caseField.show_summary_change_option ? true : false;
            const onFailMessage = `case field ${caseField.label} with show_summary_change_option value ${caseField.show_summary_change_option} failed. is ${isFieldExpectedToDisplay ? "not displayed" : "displayed"} `;
            await softAssert.assert(async () => expect(await fieldHeader.isPresent(), onFailMessage ).to.equal(isFieldExpectedToDisplay));
        }
        softAssert.finally();
    }



}

module.exports = new CaseEdit(); 
