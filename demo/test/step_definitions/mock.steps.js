var { defineSupportCode } = require('cucumber');

const MockApp = require('../nodeMock/app');

// const browserUtil = require('../../util/browserUtil');
// const nodeAppMockData = require('../../../nodeMock/nodeApp/mockData');
const CucumberReporter = require('../support/reportLogger');


defineSupportCode(function ({ And, But, Given, Then, When }) {

  

    Given('I init MockApp', async function () {
        MockApp.init();
    });

    Given('I start MockApp', async function () {
        await MockApp.startServer();
    });

    Given('I stop MockApp', async function () {
        await MockApp.stopServer();
    });

    Given('I restart MockApp', async function () {
        await MockApp.stopServer();
        await MockApp.startServer();
    });

    When('I set MOCK with user roles', async function (rolesTable) {
        const roles = [];
        const rolesTablerows = rolesTable.rows();
        for (const row of rolesTablerows) {
            roles.push(row[0]);
        }

        const userDetails = nodeAppMockData.getUserDetailsWithRoles(roles);
        CucumberReporter.AddJson(userDetails)
        MockApp.onGet('/api/user/details', (req, res) => {
            res.send(userDetails);
        });
    });

});
