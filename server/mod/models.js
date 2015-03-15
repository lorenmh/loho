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

function inArr(arr, str) {
  return arr.indexOf(str) > 0;
}

function toSlug(str) {
  return str.replace(/[^\w\s\-]/g, ' ')
    .split(' ')
    .map(function(ss) {
      return ss.toLowerCase();
    })
    .filter(function(ss) {
      return (ss.length > 0);
    })
    .join('-')
  ;
}

function slugify(Model) {
  return function(instance, options, cb) {
    global.y = instance;
    global.z = options;
    if (instance.title !== undefined) {
      var slug =  inArr(options.fields, 'slug') ? 
        instance.slug || toSlug( instance.title ) : toSlug( instance.title );
      Model.find({ where: { slug: slug } }).then( function(found) {
        if (found === null) {
          instance.slug = slug;
          cb(null, instance);
        } else {
          if (instance.id === found.id) {
            cb(null, instance);
          } else {
            var count = 1;
            slug += '-';
            (function recursiveFindUniqueSlug() {
              Model.find({ where: { slug: slug + count } })
                  .then( function(found) {
                if (found === null) {
                  instance.slug = slug + count;
                  cb(null, instance);
                } else {
                  count++;
                  recursiveFindUniqueSlug();
                }
              });
            })();
          }
        }
      });
    } else {
      // if instance title isn't set then let the validation fail
      cb(null, instance);
    }
  };
}

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
    },
    toJSON: function() {
      return '{ "foo": "bar" }';
    }
  },
  freezeTableName: true
});


var Project = sequelize.define('project', {
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
  },

  slug: {
    type: Sequelize.STRING,
    field: 'slug',
    unique: true,
    allowNull: false
  }
}, {
  freezeTableName: true,
});

var Blog = sequelize.define('blog', {
  title: {
    type: Sequelize.STRING,
    field: 'title',
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
  },

  slug: {
    type: Sequelize.STRING,
    field: 'slug',
    unique: true,
    allowNull: false
  }
}, {
  freezeTableName: true,
});

Project.hook('beforeValidate', slugify(Project));
Blog.hook('beforeValidate', slugify(Blog));

Author.hasMany(Project, {as: 'projects', foreignKey: 'authorId'});
Author.hasMany(Blog, {as: 'blogs', foreignKey: 'authorId'});

Project.belongsTo(Author, {as: 'author', foreignKey: 'authorId'});
Blog.belongsTo(Author, {as: 'author', foreignKey: 'authorId'});

module.exports.Author = Author;
module.exports.Project = Project;
module.exports.Blog = Blog;

syncPromise = new Promise( function(res, rej) {
  console.log('SYNCING');
  sequelize.sync().then( function() {
    console.log('SYNCED');
    acl.connect().then( function($acl) {
      $acl.allow([{
        roles: ['author'],
        allows: [{  resources: ['project', 'blog'],
                    permissions: ['create', 'read', 'update', 'delete']
        }]
      },
      {
        roles: ['guest'],
        allows: [{  resources: ['project', 'blog'],
                    permissions: ['read']
        }]
      }])
        .then( $acl.addUserRoles( config.GUEST_ID, 'guest' ) )
        //.then( Author.build({ name: 'Loren', password: 'foo' }).save() )
        .then( res )
        .catch( rej )
      ;
    });
  });
});

module.exports.sync = function() {
  return syncPromise;
};