/**
 * Created by vedorhto on 10/09/2015.
 */
var crypto          = require('crypto');
var conf            = require('../config/config');
var log4js          = require('log4js');
var logger          = log4js.getLogger();
var _               = require('underscore');

exports.code2json = function(req, id){
// format message returned to front
    if (arguments.length !== 2)
        return{code:'ERRXXXXX',message:'invalid function arguments for msgId2json'}
    if(!_.isObject(req))
        return{code:'ERXXXXX',message:'invalid first parameter'}
    if(!_.has(req,'__'))
        return{code:'ERXXXXX',message:'invalid first parameter'}
    if(req.__(id)===id)
        return {code:id,message:'multilangual message not found'}
    return {code:id,message:req.__(id)}
}