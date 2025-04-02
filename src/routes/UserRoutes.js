const routes = require("express").Router()
const userController = require("../contollers/UserController")
routes.post("/users",userController.signup)
routes.get("/users",userController.getAllUsers)
routes.delete("/users/:id",userController.deleteUserById)
routes.get("/users/:id",userController.getUserById)
routes.post("/users/login",userController.loginUser)
routes.post("/users/forgotpassword",userController.forgotPassword)
routes.post("/users/resetpassword",userController.resetPassword)

module.exports= routes