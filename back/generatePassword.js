/**
 * Created by vedorhto on 11/09/2015.
 */

// Load the http module to create an http server.
var http = require('http');
var crypto = require('crypto');

function makeSalt() {
    return Math.round((new Date().valueOf() * Math.random())) + '';
}

function encryptPassword (password,salt) {
    var encrypred
    try {
        encrypred = crypto.createHmac('sha1', salt).update(password).digest('hex')
        return encrypred
    } catch (err) {
        return ''
    }
}

// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) {

    var password ="12345";
    console.log('password='+password);

    var salt = makeSalt();
    console.log('salt='+salt);

    var hash = encryptPassword(password,salt);
    console.log('encrypted password: '+hash);

    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end("salt: "+salt+"\npassword: "+password+"\nencrypted password: "+hash+"\n");
});

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(9000);



