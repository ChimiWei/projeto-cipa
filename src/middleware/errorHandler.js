const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    console.log(err)
    res.status(statusCode)
    res.send(err.message)
}

module.exports = errorHandler