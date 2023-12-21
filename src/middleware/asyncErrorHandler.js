const asyncErrorHandler = (route) => {
    return async function (req, res, next) {
        try {
            await route(req, res, next)
        } catch (e) {
            console.log(e)
            next(e)
        }
    }
}

module.exports = asyncErrorHandler;