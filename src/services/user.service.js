const userRepository = require("../repositories/user.repository")
const { hashPassword } = require("../utils/hash")
const { comparePassword } = require("../utils/hash")
const { validateUser } = require("../schemas/user.schema")
const jwt = require("jsonwebtoken")
const AppError = require("../errors/AppError")
const config = require("../config/env")

class UserService {
    async create(data) {
        validateUser(data)

        const existing = await userRepository.findByEmail(data.email)

        if (existing) {
            throw new Error("E-mail já cadastrado")
        }

        const hashedPassword = await hashPassword(data.password)

        const user = {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            createdAt: new Date(),
        }

        const response = await userRepository.create(user)

        return {
            id: response._id,
            name: user.name,
            email: user.email,
        }
    }

    async list(id) {
        if (id) {
            return await userRepository.find(id)
        }
        return await userRepository.findAll()
    }

    async update(id, data) {

        const user = {
            name: data.name,
            email: data.email,
            password: await hashPassword(data.password)
        }
        await userRepository.update(id, user)
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