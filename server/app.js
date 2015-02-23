/* jshint node: true, esnext: true */

var express         = require('express');
var session         = require('client-sessions');
var bodyParser      = require('body-parser');

var logger  = require('./mod/logger');
var login   = require('./mod/login');

var vars    = require('../vars');

var app     = express();

app.use( logger() );

app.use( session({
  cookieName: 'session',
  secret: vars.session_key,
  duration: 4 * 24 * 60 * 60 * 1000, // keep alive for 4 days
  activeDuration: 1000 * 60 * 5
}) );

app.use(bodyParser.json());

app.use('/opensesame', login('login') );

app.get('/', (req, res) => {
  res.send('foo');
});

app.listen(3000);