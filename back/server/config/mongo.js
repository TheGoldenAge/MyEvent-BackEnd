/**
 * Created by vedorhto on 11/09/2015.
 */
//Load Config
var mongoose    = require('mongoose');
var moment      = require('moment');
var conf        = require('./config');
var log4js      = require('log4js');
var logger      = log4js.getLogger('config/mongo.js');
var handler     = {};

/*Initialize the mongo db connection with the given configuration*/
var database = {
    "host":"localhost",
    "port":27017,
    "name":"my-event",
    "url":"mongodb://localhost:27017/my-event"
};
var mongodbURL = database.url;
module.exports.mongodbURL = mongodbURL;

module.exports.initialize = function() {
    // Bootstrap db connection
    // Connect to mongodb
    var connect = function () {
        var options = { server: { socketOptions: { keepAlive: 1 } } }
        if(mongoose.connection.readyState === 0){
            if (mongodbURL) {
                mongoose.connect(mongodbURL, options);
                logger.info("[" + moment(new Date()).format("YYYY/MM/DD HH:mm:ss") + "] connected to db : " + mongodbURL);
            }
        }
    };
    connect()

    handler.mongoReconnector = (function() {
        connect()
    })

    // Error handler
    mongoose.connection.on('error', function (err) {
        logger.error("[" + moment(new Date()).format("YYYY/MM/DD HH:mm:ss") + "] mongo : " + err)
    })

    // Reconnect when closed
    mongoose.connection.on('disconnected', handler.mongoReconnector)
};

module.exports.close = function() {
    mongoose.connection.removeListener('disconnected', handler.mongoReconnector)
    mongoose.connection.close()
    logger.info("[" + moment(new Date()).format("YYYY/MM/DD HH:mm:ss") + "] closed db connection")
}