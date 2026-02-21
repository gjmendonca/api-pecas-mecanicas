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
            const user = await userService.create(req.body)

            return res.status(201).json({
                message: "Usuário criado com sucesso",
                data: user,
            })
        } catch (error) {
            next(error)
        }
    }

    async listAll(req, res, next) {
        try {
            const users = await userService.list()

            return res.status(200).json({
                data: users,
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