const browserWaits = require('../support/customWaits');
class AppHeader{
    headerContainer = $('.global-navigation ul');
    exampleElement = $('.example');


    async loadApp(){

        await browser.get('http://localhost:4200');

    }

    async clickHeader(header){
        await browserWaits.waitForElement(this.headerContainer);
        // await this.navigateToModule(header);
        await element(by.xpath(`//li //a[text()='${header}']`)).click();
        await browserWaits.waitForElement($(this.getCCDComponentForheader(header)));
        await this.scrollToExampleComponent();
    }

    async scrollToExampleComponent(){
        await browser.executeScript('arguments[0].scrollIntoView()',
            this.exampleElement.getWebElement())
    }

    // async navigateToModule(module){
    //     switch(module){
    //         case "Create Case":
    //             await $('li a[href="/case/create"]').click();
    //             break;

    //         default:
    //             throw new Error(`Module navigation ${module} not found`);
    //     }

    // }

    getCCDComponentForheader(header){
        let componentTag = "";
        switch (header){
            case "Create Case":
                componentTag = "ccd-case-create";
                break;
            case "Search Result":
                componentTag = "ccd-search-result";
                break;
        }
        return componentTag;
    }

}

module.exports = new AppHeader();