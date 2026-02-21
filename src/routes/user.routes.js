const express = require("express")
const router = express.Router()
const userController = require("../controllers/user.controller")
const authMiddleware = require("../middlewares/auth.middleware")

router.post("/login", userController.login)

router.post("/", authMiddleware, userController.create)
router.get("/", authMiddleware, userController.listAll)
router.get("/:id", authMiddleware, userController.getById)
router.put("/:id", authMiddleware, userController.update)
router.delete("/:id", authMiddleware, userController.delete)

module.exports = router