const {logEvents} = require('./logger')

const errorHandler = (err,req,res,next) =>{
    logEvents(`${req.url}\t${req.method}\t${req.headers.origin}\t${err.name}\t${err.message}`,'errorLogs.log')
    console.error(err.stack);
    const status = res.statusCode ? res.statusCode : 500
    res.status(status).json({'message': err.message})
    next()
}


module.exports = errorHandler