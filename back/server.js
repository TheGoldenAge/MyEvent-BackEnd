var express       = require('express');
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
var mongoConfig   = require('./server/config/mongo')

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


//module.exports = app;
app.listen(app.port,app.ipaddress, function() {
  logger.info("[" + moment(new Date()).format("YYYY/MM/DD HH:mm:ss") + "] Node server Started on %s:%d...",app.ipaddress,app.port)
})
