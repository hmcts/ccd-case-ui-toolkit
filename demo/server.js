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
        response = db.get('event-trigger').value();
      } else if (req.url.indexOf('internal/cases/1111222233334444') !== -1) {
        response = db.get('case').value();
      } 
    }
    if (response) {
      res.jsonp(response);
    } else {
      res.sendFile(path.join(__dirname+'/dist/browser/index.html'));
    }
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);