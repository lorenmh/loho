/* jshint node: true, esnext: true */
'use strict';

var config = require('../config');
var models = require('./models');

function guest_user() {
  return { id: config.GUEST_ID, name: config.GUEST_NAME };
}

module.exports = function() {
  return function(req, res, next) {
    if (req.session.user !== undefined &&
        req.session.user !== config.GUEST_ID) {
      models.Author.find({ where: { id: req.session.user } })
        .then( function(author) {
          if (author) {
            res.locals.user = author;
            next();
          } else {
            req.session.user = config.GUEST_ID;
            res.locals.user = guest_user();
            next();
          }
        })
      ;
    } else {
      req.session.user = config.GUEST_ID;
      res.locals.user = guest_user();
      next();
    }
  };
};