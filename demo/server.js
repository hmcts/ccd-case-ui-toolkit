//Install express server
const express = require('express');
const path = require('path');
let jsonServer = require('json-server');
let router = jsonServer.router('stubs/api.json');
const app = express();

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/browser'));
app.use(function (req, res) {
    let response = null;
    let db = router.db // lowdb instance
    if (req.method === 'POST') {
      res.setHeader('Content-Type', 'application/json;charset=UTF-8')
      if (req.url.indexOf('events') !== -1) {
        response = db.get('submitted_event').value();
      } else if (req.url.indexOf('validate') !== -1) {
        response = db.get('validate').value();
      } else {
        response = db.get('submitted_case').value();
      }
    } else {
      if (req.url.indexOf('event-triggers/createCase') !== -1) {
        response = db.get('create-case-event-trigger').value();
      } else if (req.url.indexOf('profile') !== -1) {
        response = db.get('profile').value();
      } else if (req.url.indexOf('event-triggers/enterCaseIntoLegacy') !== -1) {
        response = db.get('event-trigger_EnterCaseIntoLegacy').value();
      } else if (req.url.indexOf('event-triggers/stopCase') !== -1) {
        response = db.get('event-trigger_StopCase').value();
      } else if (req.url.indexOf('internal/cases/1111222233334444/events') !== -1) {
        response = db.get('history').value();
      } else if (req.url.indexOf('internal/cases/1111222233334444') !== -1) {
        response = db.get('case').value();
      } else if (req.url.indexOf('/documents') !== -1) {
        response = db.get('documents').value();
      } else if (req.url.indexOf('CT0/search-inputs') !== -1) {
        response = db.get('CT0inputs').value();
      } else if (req.url.indexOf('CT2/search-inputs') !== -1) {
        response = db.get('CT2inputs').value();
      } else if (req.url.indexOf('CT3/search-inputs') !== -1) {
        response = db.get('CT3inputs').value();
      } else if (req.url.indexOf('work-basket-inputs') !== -1) {
        response = db.get('workbasketInputs').value();
      } else if (req.url.indexOf('jurisdictions?access=read') !== -1) {
        response = db.get('jurisdictions-read').value();
      } else if (req.url.indexOf('jurisdictions?access=create') !== -1) {
        response = db.get('jurisdictions-create').value();
      }
    }
    if (response) {
      // history opens in new tab
      if (req.url.indexOf('history') !== -1) {
        res.sendFile(path.join(__dirname+'/dist/browser/index.html'));
      } else {
        res.jsonp(response);
      }
    } else {
      res.sendFile(path.join(__dirname+'/dist/browser/index.html'));
    }
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);

// Faster server renders w/ Prod mode (dev mode never needed)
import { enableProdMode } from '@angular/core';
enableProdMode();

const CONFIG = {
  'api_url': '/aggregated',
  'case_data_url': '/data',
  'document_management_url': '/documents',
  'login_url': '/login',
  'oauth2_client_id': 'ccd_gateway',
  'postcode_lookup_url': '/addresses/?postcode=${postcode}',
  'remote_document_management_url': '/documents',
  'annotation_api_url': '/em-anno',
  'payments_url': '/payments',
  'pay_bulk_scan_url': '/pay-bulkscan',
  'activity_batch_collection_delay_ms': 1,
  'activity_next_poll_request_ms': 5000,
  'activity_retry': 5,
  'activity_url': '',
  'activity_max_request_per_batch': 25,
  'print_service_url': '/print',
  'remote_print_service_url': '/remote_print',
  'pagination_page_size': 25,
  'logging_level': process.env['LOGGING_LEVEL'] || 'Debug',
  'logging_case_field_list': process.env['LOGGING_CASE_FIELD_LIST'] || 'respondents,staffUploadedDocuments'
};

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/server/main');

import { AppConfig } from './src/app/app.config';
import { AppServerConfig } from './src/app/app.server.config';
import * as config from 'config';

app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP),
    { provide: AppConfig, useValue: new AppServerConfig(CONFIG) },
  ]
}));
