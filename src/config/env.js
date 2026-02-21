require("dotenv").config()

module.exports = {
    PORT: process.env.PORT || 3000,
    ELASTIC_URL: process.env.ELASTIC_URL || "http://localhost:9200",
}