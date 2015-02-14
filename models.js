/* jshint node: true */
'use strict';

var Sequelize   = require('sequelize');
var vars        = require('./vars');
var acl         = require('./acl');

var sequelize = new Sequelize(vars.db_name, vars.db_owner, vars.db_password, {
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
      acl.connect(function(err, $acl) {
        if (err) {
          console.log('Error connecting to acl');
        } else {
          $acl.addUserRoles(author.id, 'author');
        }
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

acl.connect(function(err, $acl) {
  if (err) {
    console.log('Error connecting to acl');
  } else {
    $acl.allow('author', 'article', ['edit', 'create']);
  }
});

module.exports.Author = Author;
module.exports.Article = Article;