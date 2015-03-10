/* jshint node: true */
'use strict';

var models  = require('./models');
var acl     = require('./acl');
var msg     = require('./messages');

module.exports.C_Blog = function(user, values){
  return new Promise( function(res, rej) {
    acl.connect().then( function($acl) {
      $acl.isAllowed( user.id, 'blog', 'create' ).then( function(access) {
        if (access) {
          models.Blog.build( values )
            .save()
            .then( res )
            .catch( function(e){ rej( msg.cleanedError(e) ); })
          ;
        } else {
          rej( msg.error('Unauthorized Access') );
        }
      });
    });
  });
};

module.exports.R_Blog = function(user, id) {
  return new Promise( function(res, rej) {
    acl.connect().then( function($acl) {
      $acl.isAllowed( user.id, 'blog', 'read' ).then( function(access) {
        if (access) {
          if (id !== undefined) {
            models.Blog.find({ where: { id: id } })
              .then( res )
              .catch( function(e){ rej( msg.cleanedError(e) ); })
            ;
          } else {
            models.Blog.findAll()
              .then( res )
              .catch( function(e){ rej( msg.cleanedError(e) ); })
            ;
          }
        } else {
          rej( msg.error('Unauthorized Access') );
        }
      });
    });
  });
};