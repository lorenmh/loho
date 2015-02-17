/* jshint node: true, esnext: true */
'use strict';

var models  = require('./models');
var acl     = require('./acl');

var access_errors = (message) => {
  return { errors: [{ message: message, path: 'access control' }] };
};

module.exports.C_Article = (user, values) => {
  return new Promise( (res, rej) => {
    acl.connect().then( ($acl) => {
      $acl.isAllowed( user.id, 'article', 'create' ).then( (access) => {
        if (access) {
          models.Article.build( values )
            .save()
            .then( res )
            .error( rej )
          ;
        } else {
          rej( access_errors('unauthorized access for user') );
        }
      });
    });
  });
};

module.exports.U_Article = (user, article, values) => {
  return new Promise( (res, rej) => {
    acl.connect().then( ($acl) => {
      $acl.isAllowed( user.id, 'article', 'update' ).then( (access) => {
        if (access) {
          article.updateAttributes( values )
            .then( res )
            .error( rej )
          ;
        } else {
          rej( access_errors('unauthorized access for user') );
        }
      });
    });
  });
};