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

var TEASER_LENGTH = 200;

function inArr(arr, str) {
  return arr.indexOf(str) >= 0;
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

function teaserFromText() {
  return function(instance, options, cb) {
    if (instance.text !== undefined) {
      if (instance.teaser) {
        cb(null, instance);
      } else {
        var teaser = instance.text;
        if (teaser.length > TEASER_LENGTH) {
          teaser = teaser.substr(
            0, teaser.substr(0, TEASER_LENGTH).lastIndexOf(' ')
          );
        }
        instance.teaser = teaser;
        cb(null, instance);
      }
    } else {
      // if instance text isn't set then let the validation fail
      cb(null, instance);
    }
  };
}

// There's a bug with Sequelize, where if you're updating an instance, and you
// attempt to mutate an attribute which wasn't being updated, then it won't 
// record that you updated it. (ONLY FOR BEFOREVALIDATE)
// For ex, someInstance.updateAttribute({ bar: 2 }). and in the hook:
// function(inst, opt, fn) { inst.foo = 1; fn(null, inst) }
// it will not set foo to 1.  It will only update bar to 2.
// So I ended up putting the same code here twice, one for updates, one for
// creates

function slugifyValidate(Model) {
  return function(instance, options, cb) {
    if (instance.title !== undefined && instance.isNewRecord) {
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

function slugifyUpdate(Model) {
  return function(instance, options, cb) {
    var titleInFields, slugInFields, slug;

    titleInFields = inArr(options.fields, 'title');
    slugInFields = inArr(options.fields, 'slug');
    
    if ( titleInFields || slugInFields ) {
      if ( titleInFields && !slugInFields ) {
        slug = toSlug( instance.title );
      } else {
        slug = instance.slug || toSlug( instance.title );
      }

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

  img: {
    type: Sequelize.STRING,
    field: 'img',
    unique: false,
  },

  text: {
    type: Sequelize.TEXT,
    field: 'text',
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },

  teaser: {
    type: Sequelize.TEXT,
    field: 'teaser',
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

  teaser: {
    type: Sequelize.TEXT,
    field: 'teaser',
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

Project.hook('beforeValidate', slugifyValidate(Project));
Project.hook('beforeUpdate', slugifyUpdate(Project));
Project.hook('beforeValidate', teaserFromText());

Blog.hook('beforeValidate', slugifyValidate(Blog));
Blog.hook('beforeValidate', teaserFromText());
Blog.hook('beforeUpdate', slugifyUpdate(Blog));

Author.hasMany(Project, {as: 'projects', foreignKey: 'authorId'});
Author.hasMany(Blog, {as: 'blogs', foreignKey: 'authorId'});

Project.belongsTo(Author, {as: 'author', foreignKey: 'authorId'});
Blog.belongsTo(Author, {as: 'author', foreignKey: 'authorId'});

module.exports.Author = Author;
module.exports.Project = Project;
module.exports.Blog = Blog;


module.exports.scope = {
  teaserAttributes: {
    blog: [
      'id',
      'title',
      'teaser',
      'slug',
      'createdAt',
      'updatedAt'
    ],

    project: [
      'id',
      'title',
      'img',
      'teaser',
      'slug',
      'createdAt',
      'updatedAt'
    ]
  },
  
  fullAttributes: {
    blog: [
      'id',
      'title',
      'text',
      'slug',
      'createdAt',
      'updatedAt'
    ],
    project: [
      'id',
      'title',
      'img',
      'text',
      'slug',
      'createdAt',
      'updatedAt'
    ]
  }
};


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