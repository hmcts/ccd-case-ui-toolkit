
class BrowserUtil{

    async scrollToElement(element){
        await browser.executeScript('arguments[0].scrollIntoView()', element);
    }

}

module.exports = new BrowserUtil();

