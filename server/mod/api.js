/* jshint node: true */
'use strict';

var models  = require('./models');
var acl     = require('./acl');
var msg     = require('./messages');

function sanitize(data, keys) {
  var sanitizedData = {};
  keys.forEach( function(key) {
    if (data.hasOwnProperty(key)) {
      sanitizedData[key] = data[key];
    }
  });
  return sanitizedData;
}

var authorInclude = [
  { model: models.Author, as: 'author', attributes: ['name'] }
];

var modelAttributes = [
  'id',
  'title',
  'text',
  'slug',
  'createdAt',
  'updatedAt'
];

function filteredInstanceWithAuthor(instance) {
  var cleaned = {};

  modelAttributes.forEach(function(key) {
    cleaned[key] = instance[key];
  });

  return cleaned;
}

function createModel(Model, allowedKeys) {
  return function(user, values){

    return new Promise( function(res, rej) {
      models.sync().then( function() {
        acl.connect().then( function($acl) {
          $acl.isAllowed( user.id, Model.name.toLowerCase(), 'create' )
            .then( function(access) {
              if (access) {

                values = sanitize(values, allowedKeys);
                values.authorId = user.id;

                Model.create( values )
                  .then(function(instance) {
                    res(filteredInstanceWithAuthor(instance));
                  })
                  .catch( function(e){ rej( msg.cleanedError(e) ); })
                ;
              } else {
                rej( msg.error('Unauthorized Access') );
              }
          });
        });
      });
    });
  };
}

function readModel(Model) {
  return function(user, modelId) {
    
    return new Promise( function(res, rej) {
      models.sync().then( function() {
        acl.connect().then( function($acl) {
          $acl.isAllowed( user.id,  Model.name.toLowerCase(), 'read' )
            .then( function(access) {
              if (access) {
                if (modelId) {
                  Model.find({
                        where: { slug: modelId }, 
                        include: authorInclude,
                        attributes: modelAttributes 
                      })
                    .then( res )
                    .catch( function(e){ rej( msg.cleanedError(e) ); })
                  ;
                } else {
                  Model.findAll({ include: authorInclude,
                                  attributes: modelAttributes })
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
    });
  };
}

function updateModel(Model, allowedKeys) {
  return function(user, modelId, values){

    return new Promise( function(res, rej) {
      models.sync().then( function() {
        acl.connect().then( function($acl) {
          $acl.isAllowed( user.id, Model.name.toLowerCase(), 'update' )
            .then( function(access) {
              if (access) {
                if (modelId) {
                  console.log(1)
                  Model.find({ 
                        where: { slug: modelId },
                        include: authorInclude,
                        attributes: modelAttributes 
                      })
                    .then( function(instance) {
                      console.log(2)
                      if (instance) {
                        console.log(3)
                        values = sanitize(values, allowedKeys);
                        instance.updateAttributes(values)
                          .then( res )
                          .catch( function(e){ rej( msg.cleanedError(e) ); })
                        ;
                      } else {
                        console.log(4)
                        res( null );
                      }
                    })
                    .catch( function(e){ rej( msg.cleanedError(e) ); })
                  ;
                } else {
                  console.log(5)
                  res( null );
                }
              } else {
                console.log(6)
                rej( msg.error('Unauthorized Access') );
              }
          });
        });
      });
    });
  };
}

function deleteModel(Model) {
  return function(user, modelId) {
    return new Promise( function(res, rej) {
      models.sync().then( function() {
        acl.connect().then( function($acl) {
          $acl.isAllowed( user.id,  Model.name.toLowerCase(), 'delete' )
            .then( function(access) {
              if (access) {
                if (modelId) {
                  Model.find({ where: { slug: modelId } })
                    .then(function(instance) {
                      if (instance) {
                        instance.destroy()
                          .then( function(){ res( msg.sucess() ); })
                          .catch( function(e){ rej( msg.cleanedError(e) ); })
                        ;
                      } else {
                        res( null );
                      }
                      
                    })
                    .catch( function(e){ rej( msg.cleanedError(e) ); })
                  ;
                } else {
                  res( null );
                }
              } else {
                rej( msg.error('Unauthorized Access') );
              }
          });
        });
      });
    });
  };
}

function crudForModel(Model, allowedKeys) {
  return {
    create: createModel(Model, allowedKeys),
    read: readModel(Model),
    update: updateModel(Model, allowedKeys),
    delete: deleteModel(Model)
  };
}

module.exports = {
  blog: crudForModel(models.Blog, ['title', 'text', 'slug']),
  project: crudForModel(models.Project, ['title', 'text', 'slug']),
};

// module.exports.C_Blog = function(user, values){
//   return new Promise( function(res, rej) {
//     acl.connect().then( function($acl) {
//       $acl.isAllowed( user.id, 'blog', 'create' ).then( function(access) {
//         if (access) {
//           values = sanitize(values, ['title', 'text']);
//           values.authorId = user.id;
//           models.Blog.build( values )
//             .save()
//             .then( res )
//             .catch( function(e){ rej( msg.cleanedError(e) ); })
//           ;
//         } else {
//           rej( msg.error('Unauthorized Access') );
//         }
//       });
//     });
//   });
// };

// module.exports.R_Blog = function(user, id) {
//   return new Promise( function(res, rej) {
//     acl.connect().then( function($acl) {
//       $acl.isAllowed( user.id, 'blog', 'read' ).then( function(access) {
//         if (access) {
//           var parsedId = parseInt(id);
//           if (!isNaN(parsedId)) {
//             models.Blog.find({ where: { id: parsedId } })
//               .then( res )
//               .catch( function(e){ rej( msg.cleanedError(e) ); })
//             ;
//           } else {
//             models.Blog.findAll()
//               .then( res )
//               .catch( function(e){ rej( msg.cleanedError(e) ); })
//             ;
//           }
//         } else {
//           rej( msg.error('Unauthorized Access') );
//         }
//       });
//     });
//   });
// };
