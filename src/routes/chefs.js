const express = require('express')
const routes = express.Router()
const multer = require('../app/middlewares/multer')
const controllerChefs = require('../app/controllers/chefs')
const {onlyUsers} = require('../app/middlewares/session')
const validator = require('../app/validators/chef')

routes.get("/", onlyUsers, controllerChefs.index)
routes.get("/criar", onlyUsers, controllerChefs.create)
routes.get("/:index", onlyUsers, controllerChefs.show)
routes.get("/:index/editar", onlyUsers, controllerChefs.edit)

routes.post("/", onlyUsers, multer.single('photo'), validator.post, controllerChefs.post)
routes.put("/", onlyUsers, multer.single('photo'), validator.put, controllerChefs.put)
routes.delete("/", onlyUsers, controllerChefs.delete)

module.exports = routes