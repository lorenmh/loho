var models = require('./models');
var Author = models.Author;
var Article = models.Article;

var loren = Author.build({ name: 'Loren' });
var article = Article.build({
  title: 'Hello World',
  text: 'This is the text body of the test'
});

loren.save().success(function() {
  article.save().success(function() {
    article.setAuthor(loren).success(function() {
      
    });
  });
});