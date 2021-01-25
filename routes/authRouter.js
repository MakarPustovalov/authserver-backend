const express = require('express')
const router = new express.Router()
const authController = require('../AuthController')
const { check } = require('express-validator')

router.post('/register', [
  check('password', "Password can't be shorter than 5 symbols nor longer than 30 symbols").isLength({min: 5, max: 30}),
  check('username', "Username can't be shorter than 5 symbols nor longer than 30 symbols").isLength({min: 5, max: 30})
], authController.register)

router.post('/login', authController.login)

router.post('/refresh-tokens', authController.refreshToken)

router.get('/logout', authController.logout)

module.exports = router