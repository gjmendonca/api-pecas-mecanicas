const jwt = require("jsonwebtoken")
const AppError = require("../errors/AppError")

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    throw new AppError("Token não fornecido", 401)
  }

  const [, token] = authHeader.split(" ")

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = decoded

    next()
  } catch (error) {
    throw new AppError("Token inválido", 401)
  }
}

module.exports = authMiddleware