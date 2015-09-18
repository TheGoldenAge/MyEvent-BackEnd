/**
 * Created by atbe7403 on 26/11/2014.
 */
var passport        = require('passport');
var LocalStrategy   = require('passport-local').Strategy;
var GoogleStrategy  = require('passport-google-oauth').OAuth2Strategy;
var mongoose        = require('mongoose');
var crypto=require('crypto');
var User            = require('../models/user');
    mongoose.model('User');
var log4js          = require('log4js');
var logger          = log4js.getLogger();


module.exports = function (passport) {

    function encryptPassword (password,salt) {
        var encrypred;
        try {
            encrypred = crypto.createHmac('sha1', salt).update(password).digest('hex')
            return encrypred
        } catch (err) {
            return ''
        }
    }

    // basic login/password STRATEGY

    passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) {
                // checks in mongodb if this login exists
                User.findOne({'login': username}, function (err, user) {

                        // In case of any error, return using the done method
                        if (err) {
                            return done(err);
                        }

                        // email does not exist, log error & redirect back
                        if (!user) {
                            return done(null, false, {message: 'Invalid username or password'});
                        }
                        // User exists but wrong password, log the error
                        if (!isValidPassword(user, password)) {
                            return done(null, false, {message: 'Invalid username or password'});
                        }

                        // User and password both match, return user from
                        // done method which will be treated like success
                        return done(null, user);
                    }
                );
        }));

    // Google login STRATEGY

    passport.use(new GoogleStrategy({
            clientID: "749324401223-elvcan8f5f1qshfku69rb0uv5d14vtvb.apps.googleusercontent.com",
            clientSecret: "lOj0VrIAYlPKbo79M0JNkRlf",
            callbackURL: "http://127.0.0.1:3100/auth/google/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            console.log('profile google = '+JSON.stringify(profile));
            console.log('accesstoKen = '+accessToken);
            console.log('refreshToken = '+refreshToken);
            User.findOne({ 'google_id' :  profile.id},
                function(err, user) {
                    // In case of any error, return using the done method
                    if (err) {
                        return done(err);
                    }

                    // google email does not exist, create the account in the dcl db
                    if (!user){
                        console.log('google email does not exist, we try to create the account');
                        var newuser = new User({
                            email: profile.emails[0].value,
                            google_id: profile.id
                        });
                        newuser.save(function(err, newuser) {
                            if (err) {
                                console.error('problem while adding a google account' + err);
                                return done(null, false, { message: 'problem while adding a google account'});
                            } else {
                                console.error('google account inserted');
                                User.findOne({ 'google_id' :  profile.id},
                                    function(err, user) {
                                        // In case of any error, return using the done method
                                        if (err) {
                                            return done(err);
                                        }
                                        return done(null, user);
                                    })
                            }
                        });
                    } else {
                        // google account already exists in the dcl database, go ahead
                        console.error('google account already exists');
                        return done(null, user);
                    }
                })
        }
    ));

    var isValidPassword = function(user, password){
        if (user.password == encryptPassword(password,user.salt))
            return true;
        else
            return false;
    }

    //
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

}
