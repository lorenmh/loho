/* jshint node: true, esnext: true */
'use strict';

var Sequelize   = require('sequelize');
var vars        = require('../../vars');
var acl         = require('./acl');
var syncPromise;

var sequelize = new Sequelize(vars.db_name, vars.db_owner, vars.db_pass, {
  dialect: 'postgres'
});

// var User = sequelize.define('user');

var Author = sequelize.define('author', {
  name: {
    type: Sequelize.STRING,
    field: 'name',
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  }
}, {
  hooks: {
    afterCreate: (author, options, fn) => {
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
    field: 'title',
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },

  text: {
    type: Sequelize.TEXT,
    field: 'text',
    allowNull: false,
    validate: {
      notEmpty: true
    }
  }
}, {
  freezeTableName: true
});

var Blog = sequelize.define('blog', {
  title: {
    type: Sequelize.STRING,
    field: 'title',
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },

  text: {
    type: Sequelize.TEXT,
    field: 'text',
    allowNull: false,
    validate: {
      notEmpty: true
    }
  }
}, {
  freezeTableName: true
});

Author.hasMany(Article, {as: 'Articles'});
Author.hasMany(Blog, {as: 'Blogs'});

Article.belongsTo(Author, {as: 'Author'});
Blog.belongsTo(Author, {as: 'Author'});

module.exports.Author = Author;
module.exports.Article = Article;
module.exports.Blog = Blog;

syncPromise = new Promise( (res, rej) => {
  console.log('SYNCING');
  sequelize.sync().then( () => {
    console.log('SYNCED');
    acl.connect().then( ($acl) => {
      $acl.allow([{
        roles: ['author'],
        allows: [{  resources: ['article', 'blog'],
                    permissions: ['create', 'read', 'update', 'delete']
        }]
      },
      {
        roles: ['guest'],
        allows: [{  resources: ['article', 'blog'],
                    permissions: ['read']
        }]
      }]).then( res );
    });
  });
});

module.exports.sync = function() {
  return syncPromise;
};