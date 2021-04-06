'use strict';
const Cucumber = require('cucumber');
const { defineSupportCode } = require('cucumber');
const fs = require('fs');

const CucumberReportLog = require("./reportLogger");
const MockApp = require('../nodeMock/app');



defineSupportCode(({ Before,After }) => {
    Before( function (scenario) {
        global.scenarioData = {};
        const world = this;
        CucumberReportLog.setScenarioWorld(this);
    });

    After(async function(scenario) {
        await MockApp.stopServer();
        CucumberReportLog.AddMessage("scenario completed with status : " + scenario.result.status);
        const world = this;
        try{
            await CucumberReportLog.AddScreenshot(global.screenShotUtils);
            if (scenario.result.status === 'failed') {
                let browserLog = await browser.manage().logs().get('browser');
                let browserErrorLogs = []
                for (let browserLogCounter = 0; browserLogCounter < browserLog.length; browserLogCounter++) {
                    if (browserLog[browserLogCounter].level.value > 900) {
                        browserErrorLogs.push(browserLog[browserLogCounter]);
                    }
                }
                CucumberReportLog.AddJson(browserErrorLogs);
            } else {
                await browser.manage().logs().get('browser');
                await CucumberReportLog.AddMessage("Cleared browser logs after successful scenario.");
                await CucumberReportLog.AddScreenshot(global.screenShotUtils);
            }
        }catch(err) {
            CucumberReportLog.AddMessage("Error in hooks with browserlogs or screenshots. See error details : " + err);
        }        
    });
});
