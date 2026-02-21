require("dotenv").config()

const requiredEnvVars = ["JWT_SECRET"]

requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
        throw new Error(`Variável de ambiente obrigatória não definida: ${envVar}`)
    }
})

module.exports = {
    PORT: process.env.PORT || 3000,
    ELASTIC_URL: process.env.ELASTIC_URL || "http://localhost:9200",
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    },
}