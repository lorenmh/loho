/* jshint node: true */
'use strict';

var Sequelize   = require('sequelize');
var vars        = require('./vars');
var acl         = require('./acl');

var sequelize = new Sequelize(vars.db_name, vars.db_owner, vars.db_pass, {
  dialect: 'postgres'
});

var Author = sequelize.define('author', {
  name: {
    type: Sequelize.STRING,
    field: 'name'
  }
}, {
  hooks: {
    afterCreate: function(author, options, fn) {
      console.log('CREATED');
      acl.connect().then(function($acl) {
        $acl.addUserRoles(author.id, 'author');
      });
    }
  },

  freezeTableName: true
});

var Article = sequelize.define('article', {
  title: {
    type: Sequelize.STRING,
    field: 'title'
  },

  text: {
    type: Sequelize.TEXT,
    field: 'text'
  }
}, {
  freezeTableName: true
});

Author.hasMany(Article, {as: 'Articles'});
Article.belongsTo(Author, {as: 'Author'});

module.exports.Author = Author;
module.exports.Article = Article;

module.exports.sync = function() {
  return sequelize.sync().then(function() {
    console.log('SYNCED');
    return new Promise(function(res, rej) {
      acl.connect().then(function($acl) {
        console.log('ACL CONNECT');

        $acl.allow('author', 'article', ['edit', 'create']).then( res );

      });
    });
  });
};