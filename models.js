var Sequelize = require('sequelize');
var sequelize = new Sequelize('loho', 'loho_owner', 'loho_password', {
  dialect: 'postgres'
});
var chainer = new Sequelize.Utils.QueryChainer();

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

sequelize
  .sync({ force: true })
  .then(function() {
    chainer.add(loren).add(article);

    chainer.run().then(function() {
      article.setAuthor(loren);
    });
  })
;