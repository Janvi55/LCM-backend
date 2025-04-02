const routes = require("express").Router()
const roleController=require("../contollers/RoleController")
routes.get("/roles",roleController.getAllRoles)
routes.post("/roles",roleController.addRole)
routes.delete("/roles/:id",roleController.deleteRole)
routes.get("/roles/:id",roleController.getRoleById)

module.exports = routes