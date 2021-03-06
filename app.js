// app.js
'use strict'

var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'vagrant',
  password: '',
  database: 'twitter'
});

var moment=require('moment');

connection.connect(function(err) {
  if(err) {
    console.log(err);
    return;
  }

  console.log('Connected to the database.');

  app.listen(8080, function() {
    console.log('Web server listening on port 8080!');
  });
});

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.static('./public'));
app.use(bodyParser.urlencoded({ extended: true }));



app.get('/tweets/:id([0-9]+)/edit', function(req, res){
  var query = 'SELECT * FROM Tweets WHERE id=?';
  var id = req.params.id
  
  connection.query(query, [id], function(err, results){
    if(err||results.length==0){
      console.log(err||"No tweet found");
      res.redirect('/');
      return;
    }
    var tweet = results[0];
    tweet.time_from_now = moment(tweet.created_at).fromNow();
    res.render('edit-tweet', {tweet: results[0]});
  });
});

app.post('/tweets/:id([0-9]+)/update', function(req, res){
  var query = 'UPDATE Tweets SET body = ?, handle = ? WHERE id = ?';
  var delete_query = 'DELETE FROM Tweets WHERE id = ?';
  var id = req.params.id;
  var handle = req.body.handle;
  var body = req.body.body;
  var isDelete = req.body.delete_button !== undefined;
  var queryCallback = function(err){
  if(err){
      console.log(err);
    }
  res.redirect('/');
  };

  if(isDelete){
    connection.query(delete_query, [id]);
  }
  else{
    connection.query(query, [body, handle, id], queryCallback);
  }
});


app.get('/', function(req, res) {
  var query= 'SELECT * FROM Tweets ORDER BY created_at DESC';

  connection.query(query, function(err,results){
    if(err){
      console.log(err);
    }
    for(var i=0; i < results.length; i++)
    {
      var tweet = results[i];
      tweet.time_from_now = moment(tweet.created_at).fromNow();
    }
    res.render('tweets', { tweets: results});
  });
});

app.post('/tweets/create', function(req, res) {
  var query = 'INSERT INTO Tweets(handle, body) VALUES(?, ?)';
  var handle = req.body.handle;
  var body = req.body.body;

  connection.query(query, [handle, body], function(err) {
    if(err) {
      console.log(err);
    }

    res.redirect('/');
  });
});