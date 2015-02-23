var models = require('./models');
var Author = models.Author;
var Article = models.Article;

var loren = Author.build({ name: 'Loren', password: 'foo' });
var article = Article.build({
  title: 'Hello World',
  text: 'This is the text body of the test'
});

Promise.all([models.sync, loren.save, article.save]).then( function() {
  article.setAuthor(loren)
    .then( function() { console.log(''); });
});