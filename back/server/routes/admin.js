/**
 * Created by vedorhto on 11/09/2015.
 */
var applicationController   = require('../controllers/admin');
var mongoose                = require('mongoose');
var User                    = mongoose.model('User');
//var register                = require('../controllers/register');
var misc                    = require('../utils/misc');
var url                     = require('url');
var log4js                  = require('log4js');
var logger                  = log4js.getLogger('routes/admin.js');

module.exports = function(app, passport){

  function isAuthenticated(req, res, next) {

    var path = url.parse(req.url).pathname;
    logger.debug('isAuthenticated. route = '+path);

    // authenticated
    if (req.user) {
      return next();
    } else {
      return res.status(401).send({ success: false,message:'not authorized' });
      //return res.status(401).send(req.__('ERR00002')); // not authorized
      //return res.status(401).json(misc.code2json(req,'ERR00002')); // not authorized
    }
  };

  app.get('/api/me', isAuthenticated, function(req, res){
    return res.status(200).send();
  });

  app.post('/api/login', function(req, res, next){
    passport.authenticate('login', function(err, user, info){

      if (err) {
        return next(err);
      }

      if (!user) {
        logger.debug('err='+err);
        return res.status(403).send({ success: false, message:'invalid user or password'});
        //return res.status(403).json(misc.code2json(req,'ERR00001')); // invalid user or password
      }

      // user isn't active
      if (user.status != 'active') {
        return res.status(403).send({ success: false, message:'Account not active'});
        //return res.status(403).json(misc.code2json(req,'ERR00003')); // Account not active
      }

      //If email already existe in Database
      user.findOne({'email': user.email}, function(err){
        if(err){
          return res.status(403).send({ success: false, message:'email already exist in the database.'});
        }
      });

      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        /*// if remember me option is checked
        if (req.body.stayLoggedIn == true) {
          // req.session.cookie.maxAge = 2592000000; // -> 30j
          req.session.cookie.maxAge = 1800000; // -> 30 min, pour les tests
        } else {
          // if remember me option is checked, cookie is a browser-session cookie (expires when browser is closed)
          req.session.cookie.maxAge = null; //
        }*/
        //return res.status(200).send({success: true});
        return res.status(200).send();

      });
    })(req, res, next);
  });

  // get user email
  app.get('/api/user', isAuthenticated, function(req,res) {
    User.findOne({_id:req.user._id})
        .select('_id login email')
        .exec(function (err, user) {
          if (err) logger.error('user.findById err= '+ err.msg);
          res.status(200).json(user)
        })
  });

  app.get('/api/logout', function(req, res){
    req.logout();
    return res.status(200).send('{success: true}')
  });

  //Google oauth
  //app.get('/api/auth/google', passport.authenticate('google',{scope:['https://www.googleapis.com/auth/userinfo.profile']}));
  //app.get('/api/auth/google', passport.authenticate('google',{scope:['https://www.googleapis.com/auth/plus.login']}));
  app.get('/api/auth/google', passport.authenticate('google',{scope:['https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/userinfo.email ']}));
  app.get('/api/auth/google/callback', passport.authenticate('google',{failureRedirect: '/api/login'}),function(req, res){
    //Successful authentication, redirect home
    //res.redirect('/');
    return res.status(200).send('{success: true}');
  });

  //facebook oath
  app.get('/api/auth/facebook', passport.authenticate('facebook'));
  app.get('/api/auth/facebook/callback', passport.authenticate('facebook',{failureRedirect:'/api/login'}),function(req, res){
    return res.status(200).send('{success:true}');
  });

  //Twitter oath
  app.get('/api/auth/twitter', passport.authenticate('twitter'));
  app.get('/api/auth/twitter/callback', passport.authenticate('twitter',{failureRedirect:'/api/login'}),function(req, res){
    return res.status(200).send('{success:true}');
  });

};
