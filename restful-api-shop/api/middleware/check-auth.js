const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  try {
    //Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...
    const token = req.headers.authorization.split(' ')[1]
    console.log(token)
    // const decoded = jwt.verify(req.body.token, 'secret')
    const decoded = jwt.verify(token, 'secret')
    req.userData = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Auther middleware failed'
    })
  }
}