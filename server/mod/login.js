/* jshint node: true, esnext: true */
'use strict';

var redis         = require('redis');
var redisClient   = redis.createClient();

var config  = require('../config');
var models  = require('./models');
var msg     = require('./messages');

var attempt_login = function(params) {
  return new Promise( function(res, rej) {
    if (typeof params.name !== 'string' && 
        typeof params.password !== 'string') {
      res(false);
    }
    models.Author.find({ where: { name: params.name } })
      .then(function(author) {
        if (author === null) {
          res(false);
        } else {
          author.comparePassword(params.password).then( function(bool) {
            if (bool) {
              res(author);
            } else {
              res(false);
            }
          });
        }
      })
      .catch( rej )
    ;
  });
};

var initialize_login_log = function() {
  var d = new Date();
  return {
    recent: [ + d ],
    daily: {
      date: d.toLocaleDateString(),
      count: 1
    }
  };
};

var increment_login_log = function(login_log) {
  if (login_log) {
    var d = new Date();
    login_log.recent.push( + d );
    if (login_log.daily.date === d.toLocaleDateString()) {
      login_log.daily.count += 1;
    } else {
      login_log.daily.date = d.toLocaleDateString();
      login_log.daily.count = 1;
    }
  } else {
    login_log = initialize_login_log();
  }

  return login_log;
};

var login_allowed = function(login_log) {
  if (!login_log) {
    return true;
  } else {
    var d = new Date();

    login_log.recent = login_log.recent.filter(function(time) {
      return time + config.LOGIN_COOL_DOWN >= ( + d );
    });

    console.log(login_log.recent);

    console.log( + d - config.LOGIN_COOL_DOWN );
    console.log( login_log.daily.count );

    if (login_log.recent.length < config.LOGIN_MAX_RECENT_ATTEMPTS) {
      if (login_log.daily.count < config.LOGIN_MAX_DAILY_ATTEMPTS) {
        return true;
      }
    }

  }
  return false;
};

module.exports = function( login_template, login_redirect ) {
  return function(req, res, next) {
    if (req.method === 'GET') {
      redisClient.set(req.ip, JSON.stringify(null));
      res.send(req.ip);
      next();
    } else if (req.method === 'POST') {
      var params = req.body;
      redisClient.get(req.ip, function(e, v) {
        var login_log = JSON.parse(v);
        if (login_allowed(login_log)) {
          attempt_login(params).then( function(author) {
            if (author) {
              redisClient.set(
                req.ip,
                JSON.stringify( login_log ),
                function() {
                  req.session.user = author.id;
                  res.locals.user = author;
                  res.send( msg.success() );
                  next();
                });
            } else {
              redisClient.set(
                req.ip, 
                JSON.stringify(increment_login_log( login_log )),
                function() {
                  res.send( msg.error('Bad name or password') );
                  next();
              });
            }
          });
        } else {
          res.send( msg.error('Too many failed attempts') );
          next();
        }
      });
    }
  };
};