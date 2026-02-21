const { Client } = require("@elastic/elasticsearch")
const { ELASTIC_URL } = require("./env")

const elasticClient = new Client({
  node: ELASTIC_URL,
})

module.exports = elasticClient