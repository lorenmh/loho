/* jshint node: true */
'use strict';

var express         = require('express');
var session         = require('client-sessions');
var bodyParser      = require('body-parser');

var config  = require('./config');
var logger  = require('./mod/logger');
var login   = require('./mod/login');
var setRole = require('./mod/setRole');
var api    = require('./mod/api');
var msg     = require('./mod/messages');

var app     = express();

app.use( session(config.SESSION_OPTIONS) );

app.use( bodyParser.json() );

app.use('/opensesame', login() );

app.use('/closesesame', function(req, res, next) {
  req.session.user = undefined;
  res.locals.user = undefined;
  res.send( msg.success() );
  next();
});

app.use( setRole() );

app.use( logger() );

//app.get("/", function (req, res) {
//  crud.R_Blog(res.locals.user).then(function (blogs) {
//    res.send(blogs);
//  }).catch(function (e) {
//    res.send(e);
//  });
//});

app.use('/dist', express.static('dist'));

app.use('/api/:resource/:id?/', function(req, res) {
  var id, resource, data;
  id = typeof req.params.id !== 'undefined' ? req.params.id : null;
  resource = req.params.resource;
  if (api.hasOwnProperty(resource)) {
    if (req.method === 'GET') {
      api[resource].read( res.locals.user, id )
        .then(function(data) {
          if (data) {
            res.send(data);
          } else {
            res.sendStatus(404);
          }
        })
        .catch( function(e) {
          res.status(400).send(e);
        })
      ;
    } else if (req.method === 'POST') {
      if (id) {
        res.sendStatus(400);
      } else {
        api[resource].create( res.locals.user, req.body )
          .then(function(data) {
            if (data) {
              res.send(data);
            } else {
              res.sendStatus(400);
            }
          })
          .catch( function(e) {
            res.status(400).send(e);
          })
        ;
      }
    } else if (req.method === 'PUT') {
      if (!id) {
        res.sendStatus(400);
      } else {
        api[resource].update( res.locals.user, id, req.body )
          .then(function(data) {
            if (data) {
              res.send(data);
            } else {
              res.sendStatus(400);
            }
          })
          .catch( function(e) {
            res.status(400).send(e);
          })        
        ;
      }
    } else if (req.method === 'DELETE') {
      if (!id) {
        res.sendStatus(400);
      } else {
        api[resource].update( res.locals.user, id )
          .then(function(data) {
            if (data) {
              res.send(data);
            } else {
              res.sendStatus(404);
            }
          })
          .catch( function(e) {
            res.status(400).send(e);
          })
        ;
      }
    }
  }
  
});

// app.get('/api/blog/:id?', function(req, res) {
//   var id = typeof req.params.id !== 'undefined' ? + req.params.id : req.params.id;
//   crud.R_Blog(res.locals.user, id).then(function (blogs) {
//     if (blogs) {
//       res.send(blogs);
//     } else {
//       res.sendStatus(404);
//     }
//   }).catch(function(e) {
//     res.send(e);
//   });
// });

app.get('/*', function(req, res) {
  res.sendfile('./templates/index.html');
});

app.listen(3000);
