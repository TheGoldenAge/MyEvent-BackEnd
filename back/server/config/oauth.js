/**
 * Created by vedorhto on 25/09/2015.
 */
var ids = {
    google: {
        clientID:'278613850359-m9fcb8h6d4dhcms1o1o0i4ahe98fsmgf.apps.googleusercontent.com',
        clientSecret:'SkIGerCWrzpt4VfVV9P5TJEe',
        callbackURL:'http://127.0.0.1:3100/api/auth/google/callback'
    },
    facebook: {
        clientID:'974936779233044',
        clientSecret:'64f3209a9c8e35e29b31c1eb9f8f373f',
        callbackURL:'http://127.0.0.1:3100/api/auth/facebook/callback'
    },
    twitter: {
        clientID:'TNg4LAJqef5h8WbCG81rN3HyI',
        clientSecret:'Iv8L5bBrDSWKUzbBssBVMhWPSXeNC1QgDasznwX9JjAgAXRm2E',
        callbackURL:'http://127.0.0.1:3100/api/auth/twitter/callback'
    }
};

module.exports = ids;