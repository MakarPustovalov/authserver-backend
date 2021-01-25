const express = require('express')
const authMW = require('../middlewares/authMW')
const router = new express.Router()
const { validateAccessToken } = require('../AuthHelper')
const { ExpiredTokenError } = require('../errors/Errors')

router.get('/profile', authMW, (req, res) => {
  res.json({data: req.userinfo, isLogged: req.isLogged})
})

router.get('/', (req, res) => {
  
  if ((!req.signedCookies.accessToken) && (!req.signedCookies.refreshToken)) {
    res.json({isLogged: false})
  }

  if ((req.signedCookies.refreshToken) && (!req.signedCookies.accessToken)) {
    return next(new ExpiredTokenError('Access token expired'))
  }

  const payload = validateAccessToken(req.signedCookies.accessToken)

  res.json({isLogged: true})
})

module.exports = router