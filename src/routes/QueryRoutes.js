const routes = require("express").Router()

const queryController  = require("../contollers/QueryController")
routes.get("/queries",queryController.getAllQueries)
routes.post("/addQuery",queryController.addQuery)
routes.delete("/query/:id",queryController.deleteQuery)
routes.get("/query/:id",queryController.getQueryById)
routes.get("/queriesByUserId/:userId",queryController.getAllQueriesByUserId)
routes.put("/updateQuery/:id",queryController.updateQuery)
module.exports = routes