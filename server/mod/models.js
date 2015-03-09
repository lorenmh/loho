/* jshint node: true */
'use strict';

var Sequelize   = require('sequelize');
var bcrypt      = require('bcrypt');

var config      = require('../config');
var vars        = require('../../vars');
var acl         = require('./acl');
var syncPromise;

var sequelize = new Sequelize(vars.db_name, vars.db_owner, vars.db_pass, {
  dialect: 'postgres',
  logging: false
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
  },
  password: {
    type: Sequelize.STRING,
    field: 'password',
    allowNull: false,
    validate: {
      notEmpty: true
    },
    set: function(v) {
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(v, salt);
      this.setDataValue('password', hash);
    }
  }
}, {
  hooks: {
    afterCreate: function(author, options) {
      return new Promise( function(res, rej) {
        acl.connect().then( function($acl) {
          $acl.addUserRoles(author.id, 'author').then(res, rej);
        });
      });
    }
  },
  instanceMethods: {
    comparePassword: function (password) {
      var self = this;
      return new Promise(function (res, rej) {
        bcrypt.compare(password, self.password, function (error, response) {
          if (error) {
            rej(error);
          } else {
            res(response);
          }
        });
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

syncPromise = new Promise( function(res, rej) {
  console.log('SYNCING');
  sequelize.sync().then( function() {
    console.log('SYNCED');
    acl.connect().then( function($acl) {
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
      }])
        .then( $acl.addUserRoles( config.GUEST_ID, 'guest' ) )
        .then( res )
        .catch( rej )
      ;
    });
  });
});

module.exports.sync = function() {
  return syncPromise;
};