/* jshint node: true */
'use strict';

var models  = require('./models');
var acl     = require('./acl');

var access_errors = function(message) {
  return { errors: [{ message: message, path: 'access control' }] };
};

module.exports.C_Article = function(user, values){
  return new Promise( function(res, rej) {
    acl.connect().then( function($acl) {
      $acl.isAllowed( user.id, 'article', 'create' ).then( function(access) {
        if (access) {
          models.Article.build( values )
            .save()
            .then( res )
            .catch( rej )
          ;
        } else {
          rej( access_errors('Unauthorized Action') );
        }
      });
    });
  });
};

module.exports.R_Article = function(user, id) {
  return new Promise( function(res, rej) {
    acl.connect().then( function($acl) {
      $acl.isAllowed( user.id, 'article', 'read' ).then( function(access) {
        if (access) {
          if (id !== undefined) {
            models.Article.find({ where: { id: id } })
              .then( res )
              .catch( rej )
            ;
          } else {
            models.Article.findAll()
              .then( res )
              .catch( rej )
            ;
          }
        } else {
          rej( access_errors('Unauthorized Action') );
        }
      });
    });
  });
};