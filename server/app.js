/* jshint node: true, esnext: true */

var express         = require('express');
var session         = require('client-sessions');
var bodyParser      = require('body-parser');

var logger  = require('./mod/logger');
var login   = require('./mod/login');
var setRole = require('./mod/setRole');
var crud    = require('./mod/crud');
var msg     = require('./mod/messages');

var vars    = require('../vars');

var app     = express();

app.use( session({
  cookieName: 'session',
  secret: vars.session_key,
  duration: 345600000, // keep alive for 4 days
  activeDuration: 300000
}) );

app.use(bodyParser.json());

app.use('/opensesame', login('login') );

app.use('/closesesame', function(req, res, next) {
  req.session.user = undefined;
  res.locals.user = undefined;
  res.send( msg.success );
  next();
});

app.use('/', setRole() );

app.use( logger() );

app.get('/', function(req, res) {
  crud.C_Article( res.locals.user ).then( function(articles) {
    res.send(articles);
  }).catch(function(e) {
    res.send(e);
  });
});

app.listen(3000);