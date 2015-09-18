var express       = require('express');
var fs            = require('fs');
var moment        = require('moment');
var path          = require('path');
var http          = require('http');
var rootPath      = path.normalize(__dirname);
var favicon       = require('serve-favicon');
//var logger      = require('morgan');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var log4js        = require('log4js');
var logger        = log4js.getLogger();
var validator     = require('validator');
var mongoose      = require('mongoose');
var mongoConfig   = require('./server/config/mongo');
var passport = require('passport')

// to allow https requests
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

//Launch  MongoDB
mongoConfig.initialize();

var app = express();

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

//set up our env variables
app.setupVariables = function(){
  app.ipaddress = process.env.NODEJS_IP || "127.0.0.1";
  app.port = normalizePort(process.env.NODEJS_PORT || 3100);
};
app.setupVariables();

//SWAGGER ROUTE
app.get("/apiSwagger/api-docs",function(req,res){
  var file = rootPath+'/API_EXPLORER/api-docs-model.json';
  res.sendFile(file);
});

app.get("/apiSwagger/*",function(req,res){
  res.sendFile(rootPath+'/API_EXPLORER' +req.path.substring(11));});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// configure build passport
require('./server/utils/myPassport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// pour une expiration fixe : resave:false et rolling:false
// pour une expiration à fenêtre glissante : resave:true et rolling:true
/*app.use(session({
  secret:'secretDCL',
  cookie : {
    httpOnly: true, // so the client can't access the cookie
    maxAge: 300000// 5 min (updated when authentication is done)
  },
  saveUninitialized: false,   // don't create session until something stored

  // if resave=true -> cookie expiration date is updated at every request
  // if resave=false -> cookie expiration date is never updated
  resave: true,

  // if true the cookie is set on every response
  rolling: true,

  store: new MongoStore({
    url: mongoConfig.mongoDbUrl
  })
}));*/


// Bootstrap routes
var routes_path = rootPath + '/server/routes'
fs.readdirSync(routes_path).forEach(function (file) {
  if (~file.indexOf('.js')) {
    logger.debug("[" + moment(new Date()).format("YYYY/MM/DD HH:mm:ss") + "] Add routes from "+routes_path + "/" + file)
    require(routes_path + '/' + file)(app,passport)
  }
})


//module.exports = app;
app.listen(app.port,app.ipaddress, function() {
  logger.info("[" + moment(new Date()).format("YYYY/MM/DD HH:mm:ss") + "] Node server Started on %s:%d...",app.ipaddress,app.port)
})
