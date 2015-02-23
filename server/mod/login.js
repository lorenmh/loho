/* jshint node: true, esnext: true */
'use strict';

var redis   = require('redis');
var client  = redis.createClient();

var models  = require('./models');

var attempt_login = (params) => {
  models.Author.sync();
};

var initial_login = () => {
  var d = new Date();
  return {
    recent: [ + d ],
    daily: {
      date: d.toLocaleDateString(),
      count: 1
    }
  };
};

module.exports = ( login_template, login_redirect ) => {
  return (req, res, next) => {
    if (req.method === 'GET') {
      res.send(req.ip);
      next();
    } else if (req.method === 'POST') {
      console.log(req.body);
      // if (attempt_login)
      // client.get(req.ip, function(e, v) {
      //   if (v === null) {

      //   }
      // });
    }
  };
};