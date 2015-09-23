var assert = require('assert')
    , request = require('supertest')
    , mongoose = require('mongoose')
    , winston = require('winston')
    , agent = request.agent()
    , config = require('../server/config/mongo');
require('should');


var url = 'http://localhost:3100';

console.log('url : ' + url);
//var server = request.agent(url)


var request2 = require('superagent');
var user1 = request2.agent();


describe('testing Login', function ()
{
    // within before() you can run all the operations that are needed to setup your tests. In this case
    // I want to create a connection with the database, and when I'm done, I call done().
    describe('access', function ()
    {
        it('Database connection : ' + config.mongodbURL, function (done)
        {
            mongoose.connect(config.mongodbURL);
            done();
        })
        it('Portal access : ' + url + '/apiSwagger/   --> status 200', function (done)
        {
            request(url)
                .get('/apiSwagger/')
                // end handles the response
                .end(function (err, res) {
                    if (err) {
                        //throw err;
                        throw err.status;
                    }
                    // this is should.js syntax, very clear
                    res.should.have.property('status', 200);
                    done();
                });
        })
    });

    // ============== LOGIN =================================//
    describe('user authentication', function ()
    {
        it('trying to connect with bad login --> status 401', function (done)
        {
            var user = {
                username: 'x',
                password: 'b'
            };
            request(url)
                .post('/api/login')
                .set({'isweb': '1'})
                .send(user)
                // end handles the response
                .end(function (err, res) {
                    if (err) {
                        //throw err;
                        throw err.status;
                    }
                    // this is should.js syntax, very clear
                    //res.should.have.property('status', 401);
                    res.status.should.be.equal(401);
                    done();
                });
        });
        it('trying to connect with bad password  --> status 401', function (done)
        {
            var user = {
                username: 'serge',
                password: 'b'
            };
            request(url)
                .post('/api/login')
                .set({'isweb': '1'})
                .send(user)
                // end handles the response
                .end(function (err, res) {
                    if (err) {
                        //throw err;
                        throw err.status;
                    }
                    // this is should.js syntax, very clear
                    //res.should.have.property('status', 401);
                    res.status.should.be.equal(401);
                    done();
                });
        });

        it('trying to connect without parameter isweb and without parameter idmobile in the headers --> status 401', function (done)
        {
            var user = {
                username: 'serge',
                password: 'b'
            };
            request(url)
                .post('/api/login')
                .send(user)
                // end handles the response
                .end(function (err, res) {
                    if (err) {
                        //throw err;
                        throw err.status;
                    }
                    // this is should.js syntax, very clear
                    //res.should.have.property('status', 401);
                    //res.status.should.be.equal(401);
                    res.should.have.property('status', 401);
                    done();
                });
        });

        it('correctly connect from web --> status 200', function (done)
        {
            var user = {
                username: 'serge',
                password: '12345'
            };
            request(url)
                .post('/api/login')
                .set({'isweb': '1'})
                .send(user)
                // end handles the response
                .end(function (err, res) {
                    if (err) {
                        // throw err;
                        throw err.status;
                    }
                    // this is should.js syntax, very clear
                    //res.should.have.property('status', 200);
                    res.status.should.be.equal(200);
                    done();
                });
        });
        it('correctly connect from APP --> status 200', function (done)
        {
            var user = {
                username: 'serge',
                password: '12345'
            };
            request(url)
                .post('/api/login')
                .set({'idmobile': '0123456789'})
                .send(user)
                // end handles the response
                .end(function (err, res) {
                    if (err) {
                        //throw err;
                        throw err.status;
                    }
                    // this is should.js syntax, very clear
                    //res.should.have.property('status', 200);
                    res.status.should.be.equal(200);
                    done();
                });
        });
    })



        function loginUser(login,pwd)
        {
        console.log("trying to connect : ", login);
        return function (done) {
            request(url)
                .post('/api/login')
                .set('Accept', 'application/json')
                .send({username:login, password: pwd})
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    /*res.body.id.should.equal('1');
                     res.body.short_name.should.equal('Test user');
                     res.body.email.should.equal('user_test@example.com');*/
                    // Save the cookie to use it later to retrieve the session
                    Cookies = res.headers['set-cookie'].pop().split(';')[0];
                    done();
                });
        }
    }


        function IsCorrectResponse(txt,keys)
        //Use to control json response. Correct(True) if txt contains each keys
        {
            var arr = new Array,
                taille,
                res=true;

            for(var i in keys)
            {
                if(isArray(keys[i]))
                {
                    //Arr[0] is the key, the other are sub keys
                    //recursiv call with sub json (txt[key]])

                    arr = keys[i];
                    taille = arr.length+1;

                   // console.log("Appel recc\n ",arr);
                    if(isArray(arr[0]))
                    {
                       // console.log(arr[0]);
                       // console.log("C'est un tableau");
                        arr2 = arr[0];
                       // console.log(txt[arr2[0]]);
                        res = (res && IsCorrectResponseArray(txt[arr2[0]],arr2.slice(1,taille)));
                    }

                   res = (res && IsCorrectResponseArray(txt[arr[0]],arr.slice(1,taille)));
                }
                else
                {
                        //console.log("Test de ",keys[i],"avec\n",txt);
                        if(!(txt.hasOwnProperty(keys[i])))
                        {
                            console.log("la clé ",keys[i],"n'est pas présente dans le json\n");
                            console.log(txt);
                            res = (res && false);
                        }
                }

            }
        return res;
    }

        function IsCorrectResponseArray(arr,keys)
        //check if each cells of an array are correct
        //MAN
        /*
           ***HOW TO USE***
           ---
           Return true if all keys are in arr json
           ---Variables
           var Arr : input json. Array or not.
           keys[] : array of key to check.
           ---Samples
           keys=["_id",["contents","_id2"]] it will search _id2 in a sub entity with key contents
           keys=["_id","contents","_id"] all are at root level
           keys=["state",["contents",["_id",["coverjpg","medium"],"metadata"]]] coverjpg and metadata are at the same level
           medium is nested in coverjpg
        */
        {
            var tmp;
            var i = 1;
            //if the json is an array, iterate over element
            if(isArray(arr))
            {
                for (var i in arr)
                {
                    tmp = IsCorrectResponse(arr[i], keys);
                    //if one is false, the entire array is false
                    if (!(tmp))
                    {
                        return false;
                    }
                }
                return true;
            }
            //else just use the function
            return IsCorrectResponse(arr,keys);
        }

        function isArray(txt)
        //check if txt is an array
        {
            return Object.prototype.toString.call(txt) === '[object Array]';
        }
})


