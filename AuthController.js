const User = require('./models/User')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken
} = require('./AuthHelper')
const Token = require('./models/Token')
const {
  UnathorizedError,
  NotFoundError,
  BadRequestError,
  DBError,
  ServerError,
} = require('./errors/Errors')

class AuthController {

  async register (req, res, next) {
    try {

      const errors = validationResult(req)

      if(!errors.isEmpty()) {
        return next(new BadRequestError('Incorrect login or password'))
      }

      const {username, password} = req.body

      const candidate = await User.findOne({username})

      if (candidate) {
        return next(new BadRequestError('User already exists'))
      }

      const hashedPassword = bcrypt.hashSync(password, 7);

      const user = new User({
        username,
        password: hashedPassword
      })

      const newUser = await user.save()

      if(!newUser) {
        return next(new DBError('Database error'))
      }

      const accessToken = await createAccessToken(newUser)
      const refreshToken = await createRefreshToken(user)

      if (!(accessToken) || !(refreshToken)) {
        return next(new ServerError('Internal server error'))
      }

      return res.cookie('accessToken', accessToken, {
        maxAge: 900000,
        httpOnly: true,
        signed: true,
        domain: 'localhost'
      }).cookie('refreshToken', refreshToken, {
        maxAge: 2592000000,
        httpOnly: true,
        signed: true,
        domain: 'localhost'
      }).json({message: 'Success register', isLogged: true})
      
    } catch (error) {
      console.error(error)
      return next(error)
    }
  }

  async login (req, res, next) {
    try {

      const {username, password} = req.body

      const user = await User.findOne({username})

      if (!user) {
        return next(new NotFoundError('User does not exist'))
      }

      const isPasswordCorrect = bcrypt.compareSync(password, user.password)

      if (!isPasswordCorrect) {
        return next(new BadRequestError('Invalid password'))
      }

      const accessToken = await createAccessToken(user)
      const refreshToken = await createRefreshToken(user)

      if (!(accessToken) || !(refreshToken)) {
        return next(new ServerError('Internal server error'))
      }

      return res.cookie('accessToken', accessToken, {
        maxAge: 900000,
        httpOnly: true,
        signed: true,
        domain: 'localhost'
      }).cookie('refreshToken', refreshToken, {
        maxAge: 2592000000,
        httpOnly: true,
        signed: true,
        domain: 'localhost'
      }).json({message: 'Success login', isLogged: true})

    } catch (error) {
      console.error(error)
      return next(error)
    }
  }

  async logout (req, res, next) {
    try {

      if (!(req.signedCookies.refreshToken) && !(req.signedCookies.accessToken)) {
        return next(new UnathorizedError('You are not logged in'))
      }

      const refreshToken = req.signedCookies.refreshToken

      await Token.findOneAndDelete({ token: refreshToken })

      res.clearCookie('accessToken')
      res.clearCookie('refreshToken')
      return res.json({message: 'Logged out'})

    } catch (error) {
      console.error(error)
      return next(error)
    }
  }

  async refreshToken (req, res, next) {
    try {
      
      if (!req.signedCookies.refreshToken) {
        return next(new UnathorizedError('Not logged in'))
      }

      const token = req.signedCookies.refreshToken
      const userinfo = await verifyRefreshToken(token)

      if (!userinfo) {
        return next(new UnathorizedError('Refresh token invalid'))
      }

      const user = await User.findOne({_id: userinfo.id})

      if (!user) {
        return next(new NotFoundError('User does not exist'))
      }

      const accessToken = await createAccessToken(user)
      const refreshToken = await createRefreshToken(user)

      if (!(accessToken) || !(refreshToken)) {
        return next(new ServerError('Internal server error'))
      }

      return res.cookie('accessToken', accessToken, {
        maxAge: 900000,
        httpOnly: true,
        signed: true,
        domain: 'localhost'
      }).cookie('refreshToken', refreshToken, {
        maxAge: 2592000000,
        httpOnly: true,
        signed: true,
        domain: 'localhost'
      }).json({message: 'Success refresh', isLogged: true})

    } catch (error) {
      console.error(error)
      return next(error)
    }
  }
}

module.exports = new AuthController()