const userRepository = require("../repositories/user.repository")
const { hashPassword } = require("../utils/hash")
const { comparePassword } = require("../utils/hash")
const { validateUser } = require("../schemas/user.schema")
const jwt = require("jsonwebtoken")
const AppError = require("../errors/AppError")
const config = require("../config/env")
const pLimit = require("p-limit").default

class UserService {
    async create(data) {

        const usersArray = Array.isArray(data) ? data : [data]

        const BATCH_SIZE = 1000
        const CONCURRENCY_LIMIT = 20

        const limit = pLimit(CONCURRENCY_LIMIT)

        const startTime = Date.now()

        let totalProcessed = 0

        for (let i = 0; i < usersArray.length; i += BATCH_SIZE) {

            const batch = usersArray.slice(i, i + BATCH_SIZE)

            await Promise.all(
                batch.map((item) =>
                    limit(async () => {

                        validateUser(item)

                        const hashedPassword = await hashPassword(item.password)

                        await userRepository.create({
                            name: item.name,
                            email: item.email,
                            password: hashedPassword,
                            created_at: new Date().toISOString()
                        })

                        totalProcessed++
                    })
                )
            )
        }

        const endTime = Date.now()

        return {
            totalInserted: totalProcessed,
            totalTimeMs: endTime - startTime
        }
    }

    async list(id, page = 1, limit = 10) {

        if (id) {
            return await userRepository.find(id)
        }

        return await userRepository.findAll(page, limit)
    }

    async update(id, data) {

        const user = {
            name: data.name,
            email: data.email,
            password: await hashPassword(data.password)
        }
        const updated = await userRepository.update(id, user)

        return updated
    }

    async delete(id) {
        await userRepository.delete(id)
    }

    async login({ email, password }) {
        if (!email || !password) {
            throw new AppError("Email e senha são obrigatórios", 400)
        }

        const user = await userRepository.findByEmail(email)

        if (!user) {
            throw new AppError("Credenciais inválidas", 401)
        }

        const passwordMatch = await comparePassword(password, user.password)

        if (!passwordMatch) {
            throw new AppError("Credenciais inválidas", 401)
        }

        const token = jwt.sign(
            { userId: user.id },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        )

        return {
            token,
        }
    }
}

module.exports = new UserService()