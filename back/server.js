/**
 * Created by vedorhto on 11/09/2015.
 */
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
var session      = require('express-session');
var log4js        = require('log4js');
var logger        = log4js.getLogger('server.js');
var validator     = require('validator');
var mongoose      = require('mongoose');
var MongoStore    = require('connect-mongo')(session);
var passport      = require('passport');
var mongoConfig   = require('./server/config/mongo');

require('./server/models/user');

logger.info("[" + moment(new Date()).format("YYYY/MM/DD HH:mm:ss") + "] Init node server MyEvent");

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

//CORS defenition
var corsDomain = ''
var enableCORS = function(req, res, next) {
  corsDomain = req.headers.origin //  affect with origin url  LOAD BALANCING DEMO : CHECK IF PROBE IS OK
  res.header('Access-Control-Allow-Origin', corsDomain);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, authorization, isweb, Cookie, Origin,X-Requested-With,Accept, Authorization');
  res.header('Access-Control-Allow-Credentials','true');
  //res.header('Content-Type', 'application/json');
  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.sendStatus(200);
  }
  else {
    next();
  }
};
// enable CORS!
app.use(enableCORS);

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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

// configure build passport
require('./server/utils/myPassport')(passport);


// pour une expiration fixe : resave:false et rolling:false
// pour une expiration à fenêtre glissante : resave:true et rolling:true
app.use(session({
  secret:'secretMyEvent',
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
    url: mongoConfig.mongodbURL
  })
}));

app.use(passport.initialize());
app.use(passport.session());


// Bootstrap routes
var routes_path = rootPath + '/server/routes'
fs.readdirSync(routes_path).forEach(function (file) {
  if (~file.indexOf('.js')) {
    logger.debug("[" + moment(new Date()).format("YYYY/MM/DD HH:mm:ss") + "] Add routes from "+routes_path + "/" + file)
    require(routes_path + '/' + file)(app,passport)
  }
});


//module.exports = app;
app.listen(app.port,app.ipaddress, function() {
  logger.info("[" + moment(new Date()).format("YYYY/MM/DD HH:mm:ss") + "] Node server Started on %s:%d...",app.ipaddress,app.port)
});

app.use(function(err, req, res, next){
  if(err.errorIdentifier && err.httpStatus){
    // error page
    // TODO translate message
    res.status(err.httpStatus).json({
      status: err.errorIdentifier,
      message: err.message
    })
  }else {
    logger.error(err.stack)
    // error page
    // TODO translate message
    res.status(500).json({
      status: '500',
      message: 'the server encountered an error: '+err.toString()
    })
  }
});
app.use(function(req, res, next){
  // manage specifically get requests on path '/' (for kermit haproxy)
  // TODO translate pagenotfound.html
  if ((req.method=="GET") && (req.path=="/"))
    res.status(200).sendFile(rootPath+"/pagenotfound.html");
  else
  // for any other wrong paths, return a 404 error
    res.status(404).sendFile(rootPath+"/pagenotfound.html");
});

