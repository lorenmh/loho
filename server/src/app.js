var express = require('express');
var app     = express();

app.get('/', function(req, res) {
  console.log(req.queries);
  res.send('<h1>Hello World!</h1>');
});

app.listen(3000);