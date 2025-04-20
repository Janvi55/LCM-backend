const routes = require("express").Router()
const roleController=require("../contollers/RoleController")


routes.get("/roles",roleController.getAllRoles)
routes.post("/role",roleController.addRole)
routes.delete("/role/:id",roleController.deleteRole)
routes.get("/role/:id",roleController.getRoleById)
routes.get("/role/:id",roleController.updateRole)
module.exports = routes


//----------------------------------------------------
// routes.get("/roles",roleController.getAllRoles)
// routes.post("/roles",roleController.addRole)
// routes.delete("/roles/:id",roleController.deleteRole)
// routes.get("/roles/:id",roleController.getRoleById)
