var models = require('./run/mod/models');
models.sync().then(function(){
  models.Author.create({ name: 'Loren', password: 'foo' })
    .then(function(){
      console.log('created Loren');
    })
  ;
});