/**
 * Created by vedorhto on 22/09/2015.
 */
var async = require('async'),
    mongoose = require('mongoose'),
    user = mongoose.model('User'),
    content = mongoose.model('Content'),
    asset = mongoose.model('Asset'),
    ObjectId = require('mongoose').Types.ObjectId,
    conf = require('../config/config'),
    randtoken = require('rand-token'),
    misc = require('../utils/misc'),
    http = require('http');
var log4js        = require('log4js');
var logger        = log4js.getLogger('controller/user.js');


exports.existLogin = function (req, res, next) {
    user.findOne({username: req.params.login})
        .exec(
        function (err, user) {
            if (err) {
                res.status(500).json(misc.code2json(req,'ERR00021'));
            }
            else {

                if (user) {
                    res.status(200).json(misc.code2json(req,'MSG00017'));
                }
                else {
                    res.status(204).json(misc.code2json(req,'MSG00018'));
                }
            }
        })
}

exports.getUserInfo = function(req,res)
{
    var userId;
    try {
        userId = req.user._id
    } catch (err) {
        logger.info(err);
        res.status(401).json(misc.code2json(req,'ERR00002'));
        return;
    }
    user.find({_id:userId})
        .select('-_id username email')
        .exec(function(err,data)
        {
            if(err)
            {
                res.status(400).json(misc.code2json(req,'ERR00012'));
                return;
            }
            if(!data || data.length == 0)
            {
                res.status(200).json(misc.code2json(req,'MSG00019'));
                return;
            }
            res.status(200).json(data[0]);
            return;
        })
}


