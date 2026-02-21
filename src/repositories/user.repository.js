const elasticClient = require("../config/database")

const INDEX = "users"

class UserRepository {
    async create(user) {
        if (!user || !user.name || !user.email || !user.password) {
            throw new AppError("Nome, email e senha são obrigatórios", 400)
        }

        try {
            const response = await elasticClient.index({
                index: INDEX,
                document: user,
                refresh: true,
            })

            return {
                id: response._id,
                ...user,
            }
        } catch (error) {
            throw error
        }
    }

    async find(id) {
        try {
            const response = await elasticClient.get({
                index: INDEX,
                id: id,
            })

            return {
                id: response._id,
                ...response._source,
            }
        } catch (error) {
            if (error.meta?.statusCode === 404) {
                return null
            }

            throw error
        }
    }

    async findAll() {
        const response = await elasticClient.search({
            index: INDEX,
            query: { match_all: {} },
        })

        return response.hits.hits.map(hit => ({
            id: hit._id,
            ...hit._source,
        }))
    }


    async findByEmail(email) {
        const response = await elasticClient.search({
            index: INDEX,
            query: {
                match: {
                    email: email,
                },
            },
        })

        if (!response.hits.hits.length) {
            return null
        }

        const hit = response.hits.hits[0]

        return {
            id: hit._id,
            ...hit._source,
        }
    }

    async update(id, data) {
        try {
            await elasticClient.update({
                index: INDEX,
                id,
                doc: data,
                refresh: true,
            })

        } catch (error) {
            if (error.meta?.statusCode === 404) {
                return null
            }

            throw error
        }
    }

    async delete(id) {
        try {
            await elasticClient.delete({
                index: INDEX,
                id,
                refresh: true,
            })

        } catch (error) {
            if (error.meta?.statusCode === 404) {
                return null
            }

            throw error
        }
    }
}

module.exports = new UserRepository()