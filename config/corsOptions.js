const allowedOrigins = require('./allowedOrigins')

// || !origin
const corsOptions = {
    origin: (origin, callback)=>{
        if(allowedOrigins.indexOf(origin) !== -1 ){
            callback(null,true)
        }else{
            callback(new Error('not allowed by cors'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}

module.exports = corsOptions