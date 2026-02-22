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
                refresh: false,
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

    async findAll(page = 1, limit = 10) {

        const MAX_LIMIT = 1000

        page = page < 1 ? 1 : page
        limit = limit < 1 ? 10 : limit

        if (limit > MAX_LIMIT) {
            limit = MAX_LIMIT
        }

        const from = (page - 1) * limit

        const response = await elasticClient.search({
            index: INDEX,
            from,
            size: limit,
            query: { match_all: {} }
        })

        const total = response.hits.total.value

        const data = response.hits.hits.map(hit => ({
            id: hit._id,
            ...hit._source,
        }))

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total
            }
        }
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
        if (!data || Object.keys(data).length === 0) {
            throw new AppError("Nenhum dado informado para atualização", 400)
        }

        try {
            await elasticClient.update({
                index: INDEX,
                id,
                script: {
                    source: `
                    for (String key : params.data.keySet()) {
                        ctx._source[key] = params.data[key];
                    }
                    ctx._source.updated_at = params.updated_at;
                `,
                    params: {
                        data,
                        updated_at: new Date().toISOString()
                    }
                },
                refresh: true,
            })
            return true;



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