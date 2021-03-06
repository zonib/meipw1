var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var session = require("express-session");
var swaggerJSDoc = require('swagger-jsdoc');
// var fileUpload = require('express-fileupload');
var multer = require('multer');
// var upload = ;

var defaultUpload = __dirname + '/upload/';

var mOptions = {
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, defaultUpload);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  })
};

var db = require('./model/db'),
media = require('./model/media'),
experience = require('./model/experiences'),
travel = require('./model/travels'),
user = require('./model/user'),
friendsRequest = require('./model/friendsRequest');

var index = require('./routes/index'),
users = require('./routes/users'),
travel = require('./routes/travel'),
api = require('./routes/api');

var app = express();


//setupswaggerJSDoc
var swaggerDefinition = {
  info: {
    title: 'travel diary API',
    version: '1.2.0',
    description: 'TP1 PW',
  },
  // host: 'zeus:3000',
  // host: 'localhost:3000',
  host: "traveldiary.cleverapps.io",
  // host: 'pwtraveldiary.herokuapp.com',
  basePath: '/',
};

// options for the swagger docs
var options = {
  // import swaggerDefinitions
  swaggerDefinition: swaggerDefinition,
  // path to the API docs
  apis: ['./routes/*.js'],
};

app.get('/swagger.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});


// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);


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
  cookie: { maxAge: 60000 },
  resave: true,
  saveUninitialized: true
}));


// app.use(fileUpload());

app.use(multer(mOptions).any());
app.use(flash());

// Make our db accessible to our router
app.use(function(req,res,next){
  req.db = db;
  req.defaultUpload = defaultUpload;
  next();
});


app.use('/', index);
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
