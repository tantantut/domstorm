/*
 * Controllers. This routes everything under the sun.
 */

var modules = require('./modules.js');
var helper = require('./helper.js');
var auth = require('./auth.js');
var admin = require('./admin.js');
var search = require('./search.js');

// All Local routing goes here.
exports.set = function(app) {
  // Router()


  // Home page
  app.get('/', function(req, res) {
    var authError = 0;
    if (typeof req.query.authError != 'undefined' && req.query.authError == 1)
      authError = 1;
    res.render('index', {
      'title': 'Home Page',
      'authError': authError
    });
  });


  app.get('/testrunner', function(req, res) {
    res.render('modules/testrunner', {
      'title': 'Test'
    });
  });


  // Modules
  modules.index(app);
  modules.results(app);
  modules.fork(app);
  modules.init(app);


  // Request Modules
  helper.index(app);
  helper.headers(app);

  // Auth Modules
  auth.index(app);
  auth.twitter(app);

  // Add Admin Features
  admin.index(app);

  // All things Search
  search.index(app);

};