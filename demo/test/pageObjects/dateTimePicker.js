
const browserWaits = require('../support/customWaits')
const CucumberReporter = require('../support/reportLogger');
class DateTimePickerComponent{

    constructor(){
        this.dateTimeContainer = $('.mat-datepicker-content')
        this.calendar = $('.mat-datepicker-content .mat-calendar');
        this.timePicker = $('.ngx-mat-timepicker')
        this.confirmBtn = $('.actions button')

        this.calendarPeriodBtn = $('.mat-calendar-period-button')
        this.CalendarPeriodValue = $('.mat-calendar-period-button span')
    }

    async getFieldValue(cssSelector){
        return await $(`${cssSelector} .datepicker-container input`).getAttribute("value");
    }

    async getReadonlyFieldValue(fieldLabel) {
        return await browserWaits.retryWithActionCallback(async () => {
            return await element(by.xpath(`//dt[@class = 'case-field__label' and contains(text(),'${fieldLabel}')]/..//ccd-read-date-field/span`)).getText();     
       }); 
    }

    async waitForPickerContainer(){
        await browserWaits.waitForElementInSeconds(this.dateTimeContainer,2);
    }
    
    async openDateTimePicker(cssSelector){

        await $(`${cssSelector} button .mat-datepicker-toggle-default-icon`).click();
    }

    async getCurrentView(){
        return await browserWaits.retryWithActionCallback(async () => {
            return await $('.mat-calendar-content').getAttribute('ng-reflect-ng-switch')
        });
        
    }

    async isDateTimePickerDisplayed(){
        return await this.dateTimeContainer.isDisplayed();
    }

   async clickConfirm(){
       try{
           if (await this.isDateTimePickerDisplayed()) {
               await this.confirmBtn.click();
           }
       }
       catch(e){
           console.log(e);
       }
      
      
   }

    async setDateTime(dateTime, fieldConfig){
        await this.waitForPickerContainer();
        const dateTimeSplit = dateTime.split(" ");
        const dateVal = dateTimeSplit[0];
        const timeVal = dateTimeSplit.length > 1 ? dateTimeSplit[1] : null;

        const  dateValItem = dateVal.split("-");
        if (dateValItem[0]){
            await this.selectYear(dateValItem[0]);
        }
        if (dateValItem[1]) {
            await this.selectMonth(dateValItem[1]);
        }

        if (dateValItem[2]) {
            await this.selectDay(dateValItem[2]);
        }

        console.log("******* . INPUT TIME : " + timeVal);
        const timeValueItems = timeVal ? timeVal.split(":") : [] ; 
        if (timeValueItems[0]) {
            await this.setHours(timeValueItems[0]);
        }
        if (timeValueItems[1]) {
            await this.setMinutes(timeValueItems[1]);
        }

        if (timeValueItems[2]) {
            await this.setSeconds(timeValueItems[2]);
        }

        if (dateTimeSplit[2]){
            await this.selectMeridian(dateTimeSplit[2]);
        }

        await this.clickConfirm();
    }

    async selectYear(year){
       
        let currentView = await this.getCurrentView();
        CucumberReporter.AddMessage(`1 in ${currentView} view : To select year `);
        if(currentView === "month"){
           

            await browserWaits.retryWithActionCallback(async () => {
                CucumberReporter.AddMessage(`Clicking view chnage btn to get multi-year view`);
                await this.calendarPeriodBtn.click();
                await browserWaits.waitForSeconds(0.5);
                currentView = await this.getCurrentView();
                if (currentView !== "multi-year"){
                    throw new Error('multi-year view not displayed');
                }
            });

           
        }
        CucumberReporter.AddMessage(`2 in ${currentView} view : To select year `);
        if (currentView === "multi-year"){
            CucumberReporter.AddMessage(`in view ${currentView} clicking year  `);
            await this.selectCalendarCellContent(year);
        }else{
            CucumberReporter.AddMessage(`multi-year view not displayed `);
        }
        await browserWaits.waitForSeconds(0.5);
    }


    async selectMonth(month) {
    
        let currentView = await this.getCurrentView();
        if (currentView === "year") {
            if (month === "1" || month === "01"){
                await this.selectCalendarCellContent("JAN");
            } else if (month === "2" || month === "02"){
                await this.selectCalendarCellContent("FEB");
            } else if (month === "3" || month === "03") {
                await this.selectCalendarCellContent("MAR");
            } else if (month === "4" || month === "04") {
                await this.selectCalendarCellContent("APR");
            } else if (month === "5" || month === "05") {
                await this.selectCalendarCellContent("MAY");
            } else if (month === "6" || month === "06") {
                await this.selectCalendarCellContent("JUN");
            } else if (month === "7" || month === "07") {
                await this.selectCalendarCellContent("JUL");
            } else if (month === "8" || month === "08") {
                await this.selectCalendarCellContent("AUG");
            } else if (month === "9" || month === "09") {
                await this.selectCalendarCellContent("SEP");
            } else if (month === "10" ) {
                await this.selectCalendarCellContent("OCT");
            } else if (month === "11" ) {
                await this.selectCalendarCellContent("NOV");
            } else if (month === "12" ) {
                
            }else{
                throw new Error(`Invalid month input ${month}.`)
            }
            
        }else {
            throw new Error(`current view is ${currentView}. select year to get to month selection view`)
        }
        await browserWaits.waitForSeconds(0.5);
    }

    async selectDay(day) {
        

        let currentView = await this.getCurrentView();
        if (currentView === "month") {
            if(day.startsWith("0")){
                day = day.replace("0","");
            } 
            await this.selectCalendarCellContent(day);
        }
        else {
            throw new Error(`current view is ${currentView}. not valid view for date selection `)
        }
        await browserWaits.waitForSeconds(0.5);
    }

    async setHours(hour){
        
        const incrementEle = $$('ngx-mat-timepicker tbody tr td button[aria-label = "expand_less icon"]')
        const hourIncrement = incrementEle.get(0);
        const expectedVal = parseInt(hour);
        for(let i = 0; i < 24; i++){
            let currentValue = parseInt(await $(`ngx-mat-timepicker mat-form-field input[formcontrolname="hour"]`).getAttribute("value"));
            if (currentValue === expectedVal){
                break;
            }
            await hourIncrement.click();
        }
        await browserWaits.waitForSeconds(0.5);

    }

    async setMinutes(minute) {
        const incrementEle = $$('ngx-mat-timepicker tbody tr td button[aria-label = "expand_less icon"]')
        const minuteIncrement = incrementEle.get(1);
        const expectedVal = parseInt(minute);
        for (let i = 0; i < 61; i++) {
            let currentValue = parseInt(await $(`ngx-mat-timepicker mat-form-field input[formcontrolname="minute"]`).getAttribute("value"));
            // console.log(`minutes ${expectedVal} - ${currentValue}`)
            if (currentValue === expectedVal) {
                break;
            }
            await minuteIncrement.click();
        }
        await browserWaits.waitForSeconds(0.5);

    }

    async setSeconds(second) {
        const incrementEle = $$('ngx-mat-timepicker tbody tr td button[aria-label = "expand_less icon"]')
        const secondIncrement = incrementEle.get(2);
        const expectedVal = parseInt(second);
        for (let i = 0; i < 61; i++) {

            let currentValue = parseInt(await $(`ngx-mat-timepicker mat-form-field input[formcontrolname="second"]`).getAttribute("value"));
            // console.log(`seconds ${expectedVal} - ${currentValue}`)
            if (currentValue === expectedVal) {
                break;
            }
            await secondIncrement.click();
        }
        await browserWaits.waitForSeconds(0.5);

    }

    async selectCalendarCellContent(cellContent){
        await element(by.xpath(`//ngx-mat-calendar//td//div[text()="${cellContent}"]`)).click();
    }

    async selectMeridian(meridian){
        const meridianElement = $('ngx-mat-timepicker .meridian button');
        const currentVal = await meridianElement.getText();
        if (!currentVal.includes(meridian)){
            await meridianElement.click();
        }
        await browserWaits.waitForSeconds(0.5);
    }
 
}

module.exports = new DateTimePickerComponent();
