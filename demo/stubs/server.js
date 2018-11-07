let jsonServer = require('json-server')
let server = jsonServer.create()
let router = jsonServer.router('stubs/api.json')
let middlewares = jsonServer.defaults()

server.use(middlewares)

server.use(jsonServer.bodyParser)
server.use(function (req, res) {
  let response = {}
  let db = router.db // lowdb instance
  if (req.method === 'POST') {
    res.setHeader('Content-Type', 'application/json;charset=UTF-8')
    if (req.url.indexOf('events') !== -1) {
      response = db
        .get('submitted_event')
        .value()
    } else {
      response = db
        .get('submitted_case')
        .value()
      }
  } else {
    if (req.url.indexOf('event-triggers/createCase') !== -1) {
      response = db
      .get('create-case-event-trigger')
      .value()
    } else if (req.url.indexOf('validate') !== -1) {
      response = db
      .get('validate')
      .value()
    } else if (req.url.indexOf('profile') !== -1) {
      response = db
      .get('profile')
      .value()
    } else if (req.url.indexOf('internal/cases/1111222233334444') !== -1) {
      response = db
      .get('case')
      .value()
    } else if (req.url.indexOf('event-triggers/enterCaseIntoLegacy') !== -1) {
      response = db
      .get('event-trigger')
      .value()
    }
  }
  res.jsonp(response)
});

server.use(router)
server.listen(process.env.PORT || 3454, function () {
  console.log('JSON Server is running')
});