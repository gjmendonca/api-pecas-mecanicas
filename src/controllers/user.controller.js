const userService = require("../services/user.service")
const AppError = require("../errors/AppError")

class UserController {

    async login(req, res, next) {
        try {
            const result = await userService.login(req.body)

            return res.status(200).json(result)
        } catch (error) {
            next(error)
        }
    }
    async create(req, res, next) {
        try {
            const result = await userService.create(req.body)

            const isArray = Array.isArray(result)

            return res.status(201).json({
                success: true,
                message: isArray
                    ? `${result.length} usuário(s) criado(s) com sucesso`
                    : "Usuário criado com sucesso",
                data: result,
            })

        } catch (error) {
            next(error)
        }
    }

    async listAll(req, res, next) {
        try {

            const page = parseInt(req.query.page) || 1
            const limit = parseInt(req.query.limit) || 10

            const users = await userService.list(null, page, limit)

            return res.status(200).json({
                data: users.data,
                pagination: users.pagination
            })

        } catch (error) {
            next(error)
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params

            const user = await userService.list(id)

            if (!user) {
                throw new AppError("Usuário não encontrado", 404)
            }

            return res.status(200).json({
                data: user,
            })
        } catch (error) {
            next(error)
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params

            const updated = await userService.update(id, req.body)

            if (!updated) {
                throw new AppError("Usuário não encontrado", 404)
            }

            return res.status(200).json({
                message: "Usuário atualizado com sucesso",
            })
        } catch (error) {
            next(error)
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params

            const deleted = await userService.delete(id)

            if (!deleted) {
                throw new AppError("Usuário não encontrado", 404)
            }

            return res.status(204).send()
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new UserController()