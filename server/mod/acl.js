/* jshint node: true, esnext: true */
'use strict';

var acl     = require('acl');
var mongo   = require('mongodb');
var vars    = require('../../vars');

module.exports.connect = function(){
  return new Promise(function(res, rej) {
    mongo.connect(vars.acl_mongo_url, function(e, db) {
      console.log("CONNECT ACL");
      if (e) {
        rej(e);
      } else {
        res( new acl(new acl.mongodbBackend(db, 'acl_')) );
      }
    });
  });
};