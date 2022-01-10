

const express = require('express');
var bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const minimist = require('minimist');

const axios = require('axios');
const http = axios.create({})
axios.defaults.headers.common['Content-Type'] = 'application/json'


let { requestMapping, configurations } = require('./reqResMapping');
const { browser } = require('protractor');
const CCDCaseConfig = require('./ccd/ccdCaseConfig/caseCreateConfigGenerator');
const CCDCaseDetails = require('./ccd/ccdCaseConfig/caseDetailsConfigGenerator');

const mockServerProtocol = 'http://'
const mockServerHost = 'localhost:'

const port = 8080;


class MockApp {
    init() {
        this.requestLogs = [];
        this.clientPortCounter = 3002;
        this.scenarios = {};

        this.browserScenarioCookieCallback = null;

        this.scenarioRequestCallbacks = { proxyReqCount: 0 };

        this.intercepts = [];
        this.conf = {
            get: { ...requestMapping.get },
            post: { ...requestMapping.post },
            put: { ...requestMapping.put },
            delete: { ...requestMapping.delete }
        };
        // this.configurations = Object.assign({}, configurations)

        this.logMessageCallback = null;
        console.log("Mock Config Initialized");
        return "done";
    }

    setServerPort(portToSet) {
        this.serverPort = portToSet;
    }

    setLogMessageCallback(callback) {
        this.logMessageCallback = callback;
    }

    logMessage(message) {
        const msg = this.serverPort + " ******* Mock app : " + message;
        this.requestLogs.push(msg);
        if (this.logMessageCallback) {
            this.logMessageCallback(msg);
        } else {
            console.log(msg);
        }
    }

    onRequest(endPoint, method, req, res, callback) {
        const scenarioMockPort = this.getCookieFromRequest(req, 'scenarioMockPort');
        if (scenarioMockPort && this.serverPort !== parseInt(scenarioMockPort)) {
            const endPointprefix = endPoint.split(':')[0];
            this.proxyRequest(req, parseInt(scenarioMockPort), res, endPointprefix);
        } else {
            callback(req, res);
        }
    }

    getProxyRequestURL(request, onPort){
        const portToProxy = parseInt(onPort);
        if (portToProxy < 3002){
            throw new Error('client Port of mock is suspicious.');
        }
        return `http://localhost:${portToProxy}${request.originalUrl}`;
    }

    async proxyRequest(req, portToProxy, res, endPointprefix) {
        const headers = req.headers;

        let reqCallback = null;

        const requesUrl = `http://localhost:${portToProxy}${req.originalUrl}`

    
        switch (req.method.toLowerCase()) {
            case 'get':
                if (requesUrl.startsWith(`http://localhost:${portToProxy}${endPointprefix}`) ) {
                    reqCallback = () => http.get(requesUrl, { headers });// NOSONAR
                } else {
                    throw new Error('Proxy is not on localhost.' + requesUrl);
                }
                break;
            case 'post':
                if (requesUrl.startsWith(`http://localhost:${portToProxy}${endPointprefix}`)) {
                    reqCallback = () => http.post(requesUrl, req.body, { headers })// NOSONAR;
                } else {
                    throw new Error('Proxy is not on localhost.' + requesUrl);
                }
                break;
            case 'put':
                if (requesUrl.startsWith(`http://localhost:${portToProxy}${endPointprefix}`)) {
                    reqCallback = () => http.put(requesUrl, req.body, { headers }); // NOSONAR
                } else {
                    throw new Error('Proxy is not on localhost.' + requesUrl);
                }
                break;
            case 'delete':
                if (requesUrl.startsWith(`http://localhost:${portToProxy}${endPointprefix}`)) {
                    reqCallback = () => http.delete(requesUrl, { headers });// NOSONAR
                } else {
                    throw new Error('Proxy is not on localhost.' + requesUrl);
                }
                break;
            default:
                res.status(500).send({ error: 'mock proxy error' });

        }

        try {
            let response = await reqCallback();
            res.status(response.status).send(response.data)
        }
        catch (err) {
            res.status(err.response.status).send(err.response.data);
        }

    }

    getCookieFromRequest(req, cookieName) {
        const cookie = req.cookies[cookieName];
        this.scenarios[cookie] = this.scenarios[cookie] ? this.scenarios[cookie] : "";
        return cookie;
    }


    deleteScenarioSession(scenarioId) {
        if (scenarioId) {
            delete this.scenarioRequestCallbacks[scenarioId];
        }

    }

    getScenarioCallBack(scenarioId, method, path) {
        const sessionRequestMapping = this.scenarioRequestCallbacks[scenarioId] ? this.scenarioRequestCallbacks[scenarioId].callbacks : null;
        if (sessionRequestMapping && sessionRequestMapping[method] && sessionRequestMapping[method][path]) {
            return sessionRequestMapping[method][path];
        } else {

            if (this.serverPort !== 3001) {
                this.logMessage(Object.keys(this.scenarioRequestCallbacks));
                if (this.scenarioRequestCallbacks[scenarioId]) {
                    this.logMessage(Object.keys(this.scenarioRequestCallbacks[scenarioId]['callbacks'][method]));
                }
            }
            return null;
        }
    }

    getNextAvailableClientPort() {
        return http.get('http://localhost:8080/proxy/port', {});
    }

    async startServer() {
        const app = express();
        app.disable('etag');
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());
        app.use(cookieParser());
        app.use(express.json());

        app.get('/requestLogs', (req, res) => {
            res.set('content-type', 'application/json');
            res.send(this.requestLogs);
        });

        app.get('/proxy/port', (req, res) => {
            this.clientPortCounter++;
            res.send({ port: this.clientPortCounter });
        });

        this.intercepts.forEach(intercept => {
            app.use(intercept.url, intercept.callback);
        });

        for (const [key, value] of Object.entries(this.conf.get)) {

            app.get(key, (req, res) => this.onRequest(key, 'get', req, res, value));
        }

        for (const [key, value] of Object.entries(this.conf.post)) {
            app.post(key, (req, res) => this.onRequest(key, 'post', req, res, value));
        }

        for (const [key, value] of Object.entries(this.conf.put)) {
            app.put(key, (req, res) => this.onRequest(key, 'put', req, res, value));
        }

        for (const [key, value] of Object.entries(this.conf.delete)) {
            app.delete(key, (req, res) => this.onRequest(key, 'delete', req, res, value));
        }

        await this.stopServer();
        this.server = await app.listen(this.serverPort);



        console.log("mock api started");
        // return "Mock started successfully"

    }

    async stopServer() {
        if (this.server) {
            await this.server.close();
            this.server = null;
            console.log("Mock server stopped");

        } else {
            console.log("Mock server is null or undefined");
        }
    }

    addIntercept(url, callback) {
        this.intercepts.push({ url: url, callback: callback })
    }

    async onGet(path, callback) {
        this.conf.get[path] = callback;
    }


    async onPost(path, callback) {
        this.conf.post[path] = callback;
    }

    async onPut(path, callback) {
        this.conf.put[path] = callback;
    }

    async onDelete(path, callback) {
        this.conf.delete[path] = callback;
    }

    async setConfig(configKey, value) {
        console.log('set config not implemented');
    }
}


const mockInstance = new MockApp();
module.exports = mockInstance;


const args = minimist(process.argv)
if (args.standalone) {
    mockInstance.setServerPort(3001);
    mockInstance.init();
    mockInstance.startServer()
}
