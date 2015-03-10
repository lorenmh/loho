/* jshint node: true, esnext: true */
'use strict';

var redis         = require('redis');
var redisClient   = redis.createClient();

var config  = require('../config');
var models  = require('./models');
var msg     = require('./messages');

var attemptLogin = function(params) {
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

var initializeLoginLog = function() {
  var d = new Date();
  return {
    recent: [ + d ],
    daily: {
      date: d.toLocaleDateString(),
      count: 1
    }
  };
};

var incrementLoginlog = function(loginLog) {
  if (loginLog) {
    var d = new Date();
    loginLog.recent.push( + d );
    if (loginLog.daily.date === d.toLocaleDateString()) {
      loginLog.daily.count += 1;
    } else {
      loginLog.daily.date = d.toLocaleDateString();
      loginLog.daily.count = 1;
    }
  } else {
    loginLog = initializeLoginLog();
  }

  return loginLog;
};

var loginAllowed = function(loginLog) {
  if (!loginLog) {
    return true;
  } else {
    var d = new Date();

    loginLog.recent = loginLog.recent.filter(function(time) {
      return time + config.LOGIN_COOL_DOWN >= ( + d );
    });

    console.log(loginLog.recent);

    console.log( + d - config.LOGIN_COOL_DOWN );
    console.log( loginLog.daily.count );

    if (loginLog.recent.length < config.LOGIN_MAX_RECENT_ATTEMPTS) {
      if (loginLog.daily.count < config.LOGIN_MAX_DAILY_ATTEMPTS) {
        return true;
      }
    }

  }
  return false;
};

module.exports = function() {
  return function(req, res, next) {
    if (req.method === 'POST') {
      var params = req.body;
      redisClient.get(req.ip, function(e, v) {
        var loginLog = JSON.parse(v);
        if (loginAllowed(loginLog)) {
          attemptLogin(params).then( function(author) {
            if (author) {
              redisClient.set(
                req.ip,
                JSON.stringify( loginLog ),
                function() {
                  req.session.user = author.id;
                  res.locals.user = author;
                  res.send( msg.success() );
                  next();
                });
            } else {
              redisClient.set(
                req.ip, 
                JSON.stringify(incrementLoginlog( loginLog )),
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