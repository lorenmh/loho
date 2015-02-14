/* jshint node: true */
'use strict';

var acl     = require('acl');
var mongo   = require('mongodb');
var vars    = require('./vars');

module.exports.connect = function(cb){
  mongo.connect(vars.acl_mongo_url, function(e, db) {
    if (e) {
      cb(e);
    } else {
      cb( null, new acl(new acl.mongodbBackend(db, 'acl_')) );
    }
  });
};