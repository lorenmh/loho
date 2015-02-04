var Sequelize = require('sequelize');
var sequelize = new Sequelize('loho', 'loho_owner', 'loho_password', {
  dialect: 'postgres'
});

var Author = sequelize.define('author', {
  name: {
    type: Sequelize.STRING,
    field: 'name'
  }
}, {
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

var loren = Author.build({ name: 'Loren' });
var article = Article.build({
  title: 'Hello World',
  text: 'This is the text body of the test'
});

loren.save().success(function() {
  article.save().success(function() {
    article.setAuthor(loren);
  });
});