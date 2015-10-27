/**
 * Created by atbe7403 on 26/11/2014.
 */
var passport        = require('passport');
var LocalStrategy   = require('passport-local').Strategy;
var GoogleStrategy  = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy= require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var oauth           = require('../config/oauth')
var mongoose        = require('mongoose');
var ObjectId        = mongoose.Types.ObjectId
var User            = mongoose.model('User');
/*var User            = require('../models/user');
    mongoose.model('User');*/
var crypto          = require('crypto');
var log4js          = require('log4js');
var logger          = log4js.getLogger('utils/myPassport');

module.exports = function (passport) {

    function encryptPassword (password,salt) {
        var encrypred;
        try {
            encrypred = crypto.createHmac('sha1', salt).update(password).digest('hex');
            return encrypred
        } catch (err) {
            return ''
        }
    }

    /***************************
     * Local login STRATEGY
     * ************************/
    // basic username/password STRATEGY
    passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) {
                // checks in mongodb if this login exists
                User.findOne({'username': username}, function (err, user) {

                        // In case of any error, return using the done method
                        if (err) {
                            return done(err);
                        }

                        // Username does not exist, log error & redirect back
                        if (!user) {
                            logger.debug('User Not Found with username '+ username);
                            return done(null, false, {message: 'User Not Found.'});
                        }
                        // User exists but wrong password, log the error
                        if (!isValidPassword(user, password)) {
                            logger.debug('Invalid Password '+ password);
                            return done(null, false, {message: 'Invalid username or password'});
                        }

                        // User and password both match, return user from
                        // done method which will be treated like success
                        return done(null, user);
                        /**/

                    }
                );
        }));

    /***************************
     * Google login STRATEGY
     * ************************/
    //var GOOGLE_CLIENT_ID = "278613850359-m9fcb8h6d4dhcms1o1o0i4ahe98fsmgf.apps.googleusercontent.com";
    //var GOOGLE_CLIENT_SECRET = "SkIGerCWrzpt4VfVV9P5TJEe";
    passport.use('google',new GoogleStrategy({
            clientID: oauth.google.clientID,
            clientSecret: oauth.google.clientSecret,
            callbackURL: oauth.google.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            console.log('profile google = '+JSON.stringify(profile));
            console.log('accesstoKen = '+accessToken);
            console.log('refreshToken = '+refreshToken);
            User.findOne({ 'oauthID' :  profile.id},
                function(err, user) {
                    // In case of any error, return using the done method
                    if (err) {
                        return done(err);
                    }

                    // google email does not exist, create the account in the dcl db
                    if (!user){
                        console.log('google email does not exist, we try to create the account');
                        var newUser = new User({
                            email   : profile.emails[0].value,
                            username: profile.name.givenName,
                            status  : 'active',
                            oauthID : profile.id,
                            _id     : new ObjectId(),
                            created : Date.now()
                        });
                        newUser.save(function(err, newuser) {
                            if (err) {
                                console.error('problem while adding a google account' + err);
                                return done(null, false, { message: 'problem while adding a google account'});
                            } else {
                                console.error('google account inserted');
                                // if successful, return the new user
                                return done(null, newUser);
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

    /***************************
     * Facebook login STRATEGY
     * ************************/
    passport.use('facebook', new FacebookStrategy({
        clientID:oauth.facebook.clientID,
        clientSecret:oauth.facebook.clientSecret,
        callbackURL:oauth.facebook.callbackURL,
        profileURL:'https://graph.facebook.com/me?fields=location,first_name,last_name,middle_name,name,link,work,education,gender,timezone,locale,verified,picture,about,address,age_range,bio,birthday,cover,currency,devices,email,favorite_athletes,id,hometown,favorite_teams,inspirational_people,install_type,installed,interested_in,languages,meeting_for,name_format,political,quotes,relationship_status,religion,significant_other,sports,updated_time,website'
    },
        function(accessToken, refreshToken, profile, done){
        console.log('profile facebook = '+JSON.stringify(profile));
        console.log('accesstoKen = '+accessToken);
        console.log('refreshToken = '+refreshToken);

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
            User.findOne({ 'oauthID' : profile.id },
                function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser = new User({
                        email : profile.emails[0].value, // facebook can return multiple emails so we'll take the first
                        username:profile.name.givenName,
                        status:'active',
                        oauthID: profile.id,
                        _id: new ObjectId(),
                        created : Date.now()
                        //facebook.token : token, // we will save the token that facebook provides to the user
                        //facebook.name  : profile.name.givenName + ' ' + profile.name.familyName, // look at the passport user profile to see how names are returned
                    });
                    // set all of the facebook information in our user model
                    // save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });
        });
    }));

    /***************************
     * Twitter login STRATEGY
     * ************************/
    passport.use('twitter', new TwitterStrategy({
        consumerKey:oauth.twitter.clientID,
        consumerSecret:oauth.twitter.clientSecret,
        callbackURL:oauth.twitter.callbackURL
    },
        function(token, tokenSecret, profile, done){
        console.log('profile twitter = '+JSON.stringify(profile));
        console.log('accesstoKen = '+token);
        console.log('refreshToken = '+tokenSecret);

    }));

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
