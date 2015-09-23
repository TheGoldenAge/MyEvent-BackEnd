/**
 * Created by vedorhto on 10/09/2015.
 */
var convict = require('convict');

//Backend Parameters
var currentEnv = process.env.APP_NAME;
var conf = null;

//===================================================
//           TEST ENV CONFIGURATION
//===================================================
if(currentEnv == 'test'){

}else{
    //===================================================
    //           PROD ENV CONFIGURATION
    //===================================================
    if(currentEnv == 'production'){

    }else{
        //===================================================
        //           DEV ENV CONFIGURATION
        //===================================================
        conf = convict({
            //log level
            logLevel:{
                doc: "The level used for logging in the application",
                format: ["error","warn", "info", "debug"],
                default: "debug",
                env: "LOG_LEVEL"
            },
            //runtime environment
            env:{
                doc: "The application environment.",
                format: ["development","test", "production"],
                default: "development",
                env: "APP_NAME"
            },
            // application identity
            myEvent: {
                name: {
                    doc: "name",
                    format: "*",
                    default: "MyEvent"
                },
                email: {
                    doc: "email",
                    format: "email",
                    default: "my-event@gmail.com"
                }
            }
        });
    }


}

conf.validate();
module.exports = conf;

