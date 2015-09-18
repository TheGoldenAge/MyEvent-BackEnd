/**
 * Created by TNVL6480 on 30/10/2014.
 */

var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;
var misc        = require('../utils/misc.js');

// status of a user :
//      registered : created by not confirmed yet
//      active : created and confirmed
//      suspended : suspended by the dcl administrator
//      removed : removed by the user himself

var userSchema = new Schema({
    _id : {type: Schema.Types.ObjectId , required:true},
    status: { type: String, required:true},
    email: { type: String, required:true},
    login : {type : String, required:true, unique: true},
    password: { type: String, default: '' },
    salt: { type: String, default: '' },
    roles : [{type: String, ref: 'Role'}]
})


var validatePresenceOf = function (value) {
    return value && value.length
}

userSchema.path('login').validate(function (login) {
    return login.length
}, 'Login cannot be blank')

userSchema.path('login').validate(function (login, fn) {
    var User = mongoose.model('User')

    // Check only when it is a new user or when login field is modified
    if (this.isNew || this.isModified('login')) {
        User.find({ login: login }).exec(function (err, users) {
            fn(!err && users.length === 0)
        })
    } else fn(true)
}, 'Login already exists')

userSchema.path('email').validate(function (email) {
    return email.length
}, 'Email cannot be blank')


/*
 usersSchema.path('username').validate(function (username) {
 return username.length
 }, 'Username cannot be blank')
 */
//usersSchema.path('password').validate(function (password) {
//    return password.length
//}, 'Password cannot be blank')

/**
 * Pre-save hook
 */
/*
userSchema.pre('save', function(next) {
    console.log('validate pre save')
    if (!this.isNew) return next()

    // if not a delegated authentication, check if password is provided
    //if (misc.isEmpty(this.google_id.length)) {
    //    console.log('google id is empty !')
    //    if (!validatePresenceOf(this.password))
    //        next(new Error('Invalid password'))
    //    else
    //        next()
    //} else {
    //    console.log("google id isn't empty !")
    //    next()
    //}

})
*/

/**
 * Pre-remove hook
 */


/**
 * Methods
 */

userSchema.methods = {

    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */

    authenticate: function (plainText) {
        return !this.deleted && (this.encryptPassword(plainText) === this.password)
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */

    makeSalt: function () {
        return Math.round((new Date().valueOf() * Math.random())) + ''
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */

    encryptPassword: function (password) {
        if (!password) return ''
        var encrypred
        try {
            encrypred = crypto.createHmac('sha1', this.salt).update(password).digest('hex')
            return encrypred
        } catch (err) {
            return ''
        }
    }}

module.exports = mongoose.model('User', userSchema);
