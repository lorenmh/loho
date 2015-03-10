/* jshint node: true */
'use strict';

var express         = require('express');
var session         = require('client-sessions');
var bodyParser      = require('body-parser');

var config  = require('./config');
var logger  = require('./mod/logger');
var login   = require('./mod/login');
var setRole = require('./mod/setRole');
var crud    = require('./mod/crud');
var msg     = require('./mod/messages');

var app     = express();

app.use( session(config.SESSION_OPTIONS) );

app.use( bodyParser.json() );

app.use('/opensesame', login('login') );

app.use('/closesesame', function(req, res, next) {
  req.session.user = undefined;
  res.locals.user = undefined;
  res.send( msg.success() );
  next();
});

app.use( setRole() );

app.use( logger() );

// app.get("/", function (req, res) {
//   crud.C_Article(res.locals.user).then(function (articles) {
//     res.send(articles);
//   })["catch"](function (e) {
//     if (e.name === config.SEQUELIZE_VALIDATION_ERROR) {
//       delete e.name;
//       res.send(e);
//     } else {
//       console.log(e);
//       res.send(e.message);
//     }
//   });
// });

app.use('/dist', express.static('dist'));

app.get('/*', function(req, res) {
  res.sendfile('./templates/index.html');
});

app.listen(3000);