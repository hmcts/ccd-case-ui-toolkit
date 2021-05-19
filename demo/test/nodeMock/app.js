

const express = require('express');
var bodyParser = require('body-parser');
const minimist = require('minimist');


let { requestMapping} = require('./reqResMapping');
const { browser } = require('protractor');
const { getDateTimeTestEvent, getDateTimeInComplexTestEvent } = require('../mockData/caseEvent');
const { getMockJurisdictionWorkbaseketConfig, getConfigWithDate } = require('../mockData/workbasketSearchInput');


const port = 8080;


class MockApp{
    init(){
        this.intercepts =[];
        this.conf = {
            get: { ...requestMapping.get },
            post: { ...requestMapping.post },
            put: { ...requestMapping.put },
            delete: { ...requestMapping.delete }
        };
        // this.configurations = Object.assign({}, configurations);
        console.log("Mock Config Initialized");
        return "done";
    }

    addIntercept(url,callback){
        this.intercepts.push({url: url, callback: callback})
    }

    async startServer(){
        const app = express();
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());
        app.use(express.json()); 

        this.intercepts.forEach(intercept =>{
            app.use(intercept.url, intercept.callback);
        }); 

        for (const [key, value] of Object.entries(this.conf.get)) {
            app.get(key, value);
        }

        for (const [key, value] of Object.entries(this.conf.post)) {
            app.post(key, value);
        }

        for (const [key, value] of Object.entries(this.conf.put)) {
            app.put(key, value);
        }

        for (const [key, value] of Object.entries(this.conf.delete)) {
            app.delete(key, value);
        }

        this.server = await app.listen(port)
        console.log("mock api started");
        // return "Mock started successfully"

    }

    async stopServer(){
        if (this.server){
            await this.server.close();
            this.server = null;
            console.log("Mock server stopped");

        }else{
            console.log("Mock server is null or undefined");
        }
    }

   
    onGet(path, callback){
        this.conf.get[path] = callback; 
    }


    onPost(path, callback){
        this.conf.post[path] = callback; 
    }

    onPut(path, callback){
        this.conf.put[path] = callback; 
    }

    onDelete(path, callback){
        this.conf.delete[path] = callback; 
    }

    setConfig(configKey,value){
       this.configurations[configKey] = value; 
    }

}


const mockInstance = new MockApp();
module.exports = mockInstance;

const args = minimist(process.argv)
if (args.standalone){
    mockInstance.init();

    setUpcaseConfig();
    // getDLCaseConfig();
    // collectionDynamicListeventConfig()
    // createCustomCaseDetails();
    mockInstance.startServer()
}

function setUpcaseConfig() {
    mockInstance.onGet('/data/internal/case-types/:jurisdiction/event-triggers/:caseType', (req, res) => {
        res.send(caseEvent);
    });

    mockInstance.onGet('/data/internal/case-types/:jurisdiction/work-basket-inputs', (req, res) => {
        let config = getConfigWithDate();
     
        res.send(config.getConfig());
    });

}

const caseEvent = {
    "id": "Mock event ",
    "name": "Mock jurisdiction",
    "description": "test description muliDateFields",
    "case_id": null,
    "case_fields": [
        {
            "id": "dt1",
            "label": "Date 1",
            "hidden": null,
            "order": null,
            "metadata": false,
            "case_type_id": null,
            "hint_text": null,
            "field_type": {
                "id": "DateTime",
                "type": "DateTime",
                "min": null,
                "max": null,
                "regular_expression": null,
                "fixed_list_items": [],
                "complex_fields": [],
                "collection_field_type": null
            },
            "security_classification": "PUBLIC",
            "live_from": null,
            "live_until": null,
            "show_condition": null,
            "acls": [],
            "complexACLs": [],
            "display_context": "OPTIONAL",
            "display_context_parameter": null,
            "formatted_value": null,
            "default_value": null,
            "retain_hidden_value": null,
            "show_summary_change_option": true,
            "show_summary_content_option": null,
            "value": "2021-04-15T22:21:30.000Z"
        },
        {
            "id": "f2",
            "label": "complex 1",
            "hidden": null,
            "order": null,
            "metadata": false,
            "case_type_id": null,
            "hint_text": null,
            "field_type": {
                "id": "Complex",
                "type": "Complex",
                "min": null,
                "max": null,
                "regular_expression": null,
                "fixed_list_items": [],
                "complex_fields": [
                    {
                        "id": "l1",
                        "label": "text in complex",
                        "hidden": null,
                        "order": null,
                        "metadata": false,
                        "case_type_id": null,
                        "hint_text": null,
                        "field_type": {
                            "id": "Text",
                            "type": "Text",
                            "min": null,
                            "max": null,
                            "regular_expression": null,
                            "fixed_list_items": [],
                            "complex_fields": [],
                            "collection_field_type": null
                        },
                        "security_classification": "PUBLIC",
                        "live_from": null,
                        "live_until": null,
                        "show_condition": null,
                        "acls": [],
                        "complexACLs": [],
                        "display_context": "OPTIONAL",
                        "display_context_parameter": null,
                        "formatted_value": null,
                        "default_value": null,
                        "retain_hidden_value": null,
                        "show_summary_change_option": true,
                        "show_summary_content_option": null
                    },
                    {
                        "id": "dt1",
                        "label": "Date Mandatory",
                        "hidden": null,
                        "order": null,
                        "metadata": false,
                        "case_type_id": null,
                        "hint_text": null,
                        "field_type": {
                            "id": "Date",
                            "type": "Date",
                            "min": null,
                            "max": null,
                            "regular_expression": null,
                            "fixed_list_items": [],
                            "complex_fields": [],
                            "collection_field_type": null
                        },
                        "security_classification": "PUBLIC",
                        "live_from": null,
                        "live_until": null,
                        "show_condition": null,
                        "acls": [],
                        "complexACLs": [],
                        "display_context": "OPTIONAL",
                        "display_context_parameter": "#DATETIMEENTRY(YYYY-MM-DD hh:mm:ss),#DATETIMEENTRY(YYYY-MM hh:mm:ss)",
                        "formatted_value": null,
                        "default_value": null,
                        "retain_hidden_value": null,
                        "show_summary_change_option": true,
                        "show_summary_content_option": null
                    },
                    {
                        "id": "dt2",
                        "label": "DateTime Optional",
                        "hidden": null,
                        "order": null,
                        "metadata": false,
                        "case_type_id": null,
                        "hint_text": null,
                        "field_type": {
                            "id": "Date",
                            "type": "Date",
                            "min": null,
                            "max": null,
                            "regular_expression": null,
                            "fixed_list_items": [],
                            "complex_fields": [],
                            "collection_field_type": null
                        },
                        "security_classification": "PUBLIC",
                        "live_from": null,
                        "live_until": null,
                        "show_condition": null,
                        "acls": [],
                        "complexACLs": [],
                        "display_context": "OPTIONAL",
                        "display_context_parameter": "#DATETIMEENTRY(YYYY-MM-DD hh:mm:ss),#DATETIMEENTRY(YYYY-MM hh:mm:ss)",
                        "formatted_value": null,
                        "default_value": null,
                        "retain_hidden_value": null,
                        "show_summary_change_option": true,
                        "show_summary_content_option": null
                    },
                    {
                        "id": "dt3",
                        "label": "DateTime readonly",
                        "hidden": null,
                        "order": null,
                        "metadata": false,
                        "case_type_id": null,
                        "hint_text": null,
                        "field_type": {
                            "id": "Date",
                            "type": "Date",
                            "min": null,
                            "max": null,
                            "regular_expression": null,
                            "fixed_list_items": [],
                            "complex_fields": [],
                            "collection_field_type": null
                        },
                        "security_classification": "PUBLIC",
                        "live_from": null,
                        "live_until": null,
                        "show_condition": null,
                        "acls": [],
                        "complexACLs": [],
                        "display_context": "OPTIONAL",
                        "display_context_parameter": "#DATETIMEENTRY(YYYY-MM-DD hh:mm:ss),#DATETIMEENTRY(YYYY-MM hh:mm:ss)",
                        "formatted_value": null,
                        "default_value": null,
                        "retain_hidden_value": null,
                        "show_summary_change_option": true,
                        "show_summary_content_option": null
                    },
                    {
                        "id": "c1",
                        "label": "Complex in f2",
                        "hidden": null,
                        "order": null,
                        "metadata": false,
                        "case_type_id": null,
                        "hint_text": null,
                        "field_type": {
                            "id": "Complex",
                            "type": "Complex",
                            "min": null,
                            "max": null,
                            "regular_expression": null,
                            "fixed_list_items": [],
                            "complex_fields": [
                                {
                                    "id": "t2",
                                    "label": "Text in c1 f2",
                                    "hidden": null,
                                    "order": null,
                                    "metadata": false,
                                    "case_type_id": null,
                                    "hint_text": null,
                                    "field_type": {
                                        "id": "Text",
                                        "type": "Text",
                                        "min": null,
                                        "max": null,
                                        "regular_expression": null,
                                        "fixed_list_items": [],
                                        "complex_fields": [],
                                        "collection_field_type": null
                                    },
                                    "security_classification": "PUBLIC",
                                    "live_from": null,
                                    "live_until": null,
                                    "show_condition": null,
                                    "acls": [],
                                    "complexACLs": [],
                                    "display_context": "OPTIONAL",
                                    "display_context_parameter": null,
                                    "formatted_value": null,
                                    "default_value": null,
                                    "retain_hidden_value": null,
                                    "show_summary_change_option": true,
                                    "show_summary_content_option": null
                                }
                            ],
                            "collection_field_type": null
                        },
                        "security_classification": "PUBLIC",
                        "live_from": null,
                        "live_until": null,
                        "show_condition": null,
                        "acls": [],
                        "complexACLs": [],
                        "display_context": "OPTIONAL",
                        "display_context_parameter": null,
                        "formatted_value": null,
                        "default_value": null,
                        "retain_hidden_value": null,
                        "show_summary_change_option": true,
                        "show_summary_content_option": null
                    }
                ],
                "collection_field_type": null
            },
            "security_classification": "PUBLIC",
            "live_from": null,
            "live_until": null,
            "show_condition": null,
            "acls": [],
            "complexACLs": [],
            "display_context": "OPTIONAL",
            "display_context_parameter": null,
            "formatted_value": null,
            "default_value": null,
            "retain_hidden_value": null,
            "show_summary_change_option": true,
            "show_summary_content_option": null,
            "value": {
                "l1": "test text in complex",
                "dt1": "2020-12-12T12:12:12.000Z",
                "dt2": "2021-11-11T11:11:11.000Z",
                "dt3": "2021-10-10T11:11:11.000Z",
                "c1": {
                    "t2": "test Text in c1 f2"
                }
            }
        }
    ],
    "event_token": "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJpcTlxNWs5NW85cWllNTk5NnU1MmEyNGhqYiIsInN1YiI6IjQxYTkwYzM5LWQ3NTYtNGViYS04ZTg1LTViNWJmNTZiMzFmNSIsImlhdCI6MTU5NjU0NzA2NSwiZXZlbnQtaWQiOiJGUl9zb2xpY2l0b3JDcmVhdGUiLCJjYXNlLXR5cGUtaWQiOiJGaW5hbmNpYWxSZW1lZHlDb250ZXN0ZWQiLCJqdXJpc2RpY3Rpb24taWQiOiJESVZPUkNFIiwiY2FzZS12ZXJzaW9uIjoiYmYyMWE5ZThmYmM1YTM4NDZmYjA1YjRmYTA4NTllMDkxN2IyMjAyZiJ9.QXtddQWsWbl8H8tKvM-SViK-E9JrFeU6bS0wlt5eJ0o",
    "wizard_pages": [
        {
            "id": "page1",
            "label": "Page 1 for mock event",
            "order": 0,
            "wizard_page_fields": [
                {
                    "case_field_id": "dt1",
                    "order": 0,
                    "page_column_no": 1,
                    "complex_field_overrides": []
                },
                {
                    "case_field_id": "f2",
                    "order": 1,
                    "page_column_no": 1,
                    "complex_field_overrides": [
                        {
                            "complex_field_element_id": "f2.dt1",
                            "display_context": "MANDATORY",
                            "label": null,
                            "hint_text": null,
                            "show_condition": "",
                            "retain_hidden_value": null
                        }
                    ]
                }
            ],
            "show_condition": null,
            "callback_url_mid_event": "http://finrem-cos-aat.service.core-compute-aat.internal/case-orchestration/contested/set-defaults",
            "retries_timeout_mid_event": []
        }
    ],
    "show_summary": true,
    "show_event_notes": false,
    "end_button_label": null,
    "can_save_draft": null,
    "_links": {
        "self": {
            "href": "http://gateway-ccd.aat.platform.hmcts.net/internal/case-types/FinancialRemedyContested/event-triggers/FR_solicitorCreate?ignore-warning=false"
        }
    }
}