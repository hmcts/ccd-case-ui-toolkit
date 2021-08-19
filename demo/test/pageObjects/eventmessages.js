
const BrowserWaits = require('../support/customWaits');

class EventMessages{

    constructor(){
        this.messagesElement = $('#eventMessages');
        this.lastMessageElement = $('.eventMessage');
        this.allMessagesElements = $$('.eventMessage')
    }

    async getLastMessage(){
        await BrowserWaits.waitForElement(this.lastMessageElement);
        return await this.lastMessageElement.getText();
    }

    async getTotalEventsCount(){
        return await this.allMessagesElements.count();
    }

    async isEventWithMessageTriggered(message){
        const allMessagesText = await this.messagesElement.getText();
        return allMessagesText.includes(message);
    }




}

module.exports = new EventMessages();
