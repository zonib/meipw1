var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var session = require("express-session");


var index = require('./routes/index');
var users = require('./routes/users');
var travel = require('./routes/travel');
// var travels = require('./routes/travels');
var api = require('./routes/api');


//database setup
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient
var monk = require('monk');
// var db = monk('localhost:27017/traveldiary');
// MongoClient.connect('your-mongodb-url', (err, database) => {
//   if (err) return console.log(err)
//   db = database
//   app.listen(3000, () => {
//     console.log('listening on 3000')
//   })
// })

var db = monk('zzonib:Ipca2017!..@cluster0-shard-00-00-0ye1h.mongodb.net:27017,cluster0-shard-00-01-0ye1h.mongodb.net:27017,cluster0-shard-00-02-0ye1h.mongodb.net:27017/<DATABASE>?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: "123",
  key: 'app.sess',
  cookie: { maxAge: 60000 }
}));

app.use(flash());

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', index);
app.use('/users', users);
app.use('/travel', travel);
// app.use('/api/travels', travels);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
