const {
  accessSecret,
  refreshSecret
} = require('./config').jwt
const jwt = require('jsonwebtoken')
const Token = require('./models/Token')

const createAccessToken = user => {

  try {

    const payload = {
      type: 'access',
      username: user.username,
      id: user._id,
      date: user.date.toUTCString()
    }

    return jwt.sign(payload, accessSecret, {
      expiresIn: "10m"
    });

  } catch (error) {
    throw new Error(error)
  }
}

async function createRefreshToken(user) {
  try {

    const payload = {
      type: 'refresh',
      username: user.username,
      id: user._id,
      date: user.date.toUTCString()
    }

    const refreshToken = jwt.sign(payload, refreshSecret, {
      expiresIn: "30d"
    });

    let newToken = await Token.findOneAndUpdate({
      userId: user._id
    }, {
      token: refreshToken
    }, {
      new: true
    });

    if (!newToken) {
      const token = new Token({
        userId: user._id,
        token: refreshToken
      })

      newToken = await token.save()
    }

    if (!newToken) return

    return newToken.token

  } catch (error) {
    throw new Error(error)
  }

}

async function verifyRefreshToken(token) {
  try {

    const refreshToken = await Token.findOne({
      token: token
    })

    if (!refreshToken) return

    return jwt.verify(refreshToken.token, refreshSecret)

  } catch (error) {
    throw new Error(error)
  }
}

const validateAccessToken = (token) => {
  try {

    return jwt.verify(token, accessSecret)
  
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  validateAccessToken
}