/* jshint node: true */
'use strict';

var models  = require('./models');
var acl     = require('./acl');
var msg     = require('./messages');

var scope = models.scope;

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

function filteredInstanceWithAuthor(instance, mdlName) {
  var cleaned = {};

  scope.fullAttributes[mdlName].forEach(function(key) {
    cleaned[key] = instance[key];
  });

  return cleaned;
}

function createModel(Model, allowedKeys) {
  var mdlName = Model.name.toLowerCase();
  return function(user, values){

    return new Promise( function(res, rej) {
      models.sync().then( function() {
        acl.connect().then( function($acl) {
          $acl.isAllowed( user.id, mdlName, 'create' )
            .then( function(access) {
              if (access) {

                values = sanitize(values, allowedKeys);
                values.authorId = user.id;

                Model.create( values )
                  .then(function(instance) {
                    res(filteredInstanceWithAuthor(instance, mdlName));
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
  var mdlName = Model.name.toLowerCase();
  return function(user, modelId) {
    
    return new Promise( function(res, rej) {
      models.sync().then( function() {
        acl.connect().then( function($acl) {
          $acl.isAllowed( user.id,  mdlName, 'read' )
            .then( function(access) {
              if (access) {
                if (modelId) {
                  Model.find({
                        where: { slug: modelId }, 
                        include: authorInclude,
                        attributes: scope.fullAttributes[ mdlName ]
                      })
                    .then( res )
                    .catch( function(e){ rej( msg.cleanedError(e) ); })
                  ;
                } else {
                  Model.findAll({ include: authorInclude,
                                  attributes: scope.teaserAttributes[mdlName]})
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
  var mdlName = Model.name.toLowerCase();
  return function(user, modelId, values){

    return new Promise( function(res, rej) {
      models.sync().then( function() {
        acl.connect().then( function($acl) {
          $acl.isAllowed( user.id, mdlName, 'update' )
            .then( function(access) {
              if (access) {
                if (modelId) {
                  Model.find({ 
                        where: { slug: modelId },
                        include: authorInclude,
                        attributes: scope.fullAttributes[ mdlName ]
                      })
                    .then( function(instance) {
                      if (instance) {
                        values = sanitize(values, allowedKeys);
                        instance.updateAttributes(values)
                          .then( res )
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

function deleteModel(Model) {
  var mdlName = Model.name.toLowerCase();
  return function(user, modelId) {
    return new Promise( function(res, rej) {
      models.sync().then( function() {
        acl.connect().then( function($acl) {
          $acl.isAllowed( user.id,  mdlName, 'delete' )
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
