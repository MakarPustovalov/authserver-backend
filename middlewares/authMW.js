const jwt = require("jsonwebtoken")
const { accessSecret } = require("../config").jwt
const { UnathorizedError, ExpiredTokenError } = require('../errors/Errors')
const { validateAccessToken } = require('../AuthHelper')

module.exports = function authMW (req, res, next) {
  if(req.method === "OPTIONS") {
    next()
  }

  try {

    // if (!req.headers.authorization) {
    //   return res.status(400).json({message: 'Please, log in'})
    // }

    // const token = req.headers.authorization.split(' ')[1]

    if ((!req.signedCookies.accessToken) && (!req.signedCookies.refreshToken)) {
      return next(new UnathorizedError('Not logged in'))
    }

    if ((req.signedCookies.refreshToken) && (!req.signedCookies.accessToken)) {
      return next(new ExpiredTokenError('Access token expired'))
    }

    const payload = validateAccessToken(req.signedCookies.accessToken)

    req.userinfo = payload
    req.isLogged = true

    next()
    
  } catch (error) {
    if (req.url === '/') {
      return res.status(200).send({message: 'Not loggedIn'})
    }

    if (error instanceof jwt.TokenExpiredError) {
      return next(new ExpiredTokenError('Access token expired'))
    }

    return next(error)
  }
}