const express = require('express')
const routes = express.Router()
const multer = require('../app/middlewares/multer')
const controllerRecipes = require('../app/controllers/recipes')
const {onlyUsers} = require('../app/middlewares/session')
const validator = require('../app/validators/chef')

routes.get("/", onlyUsers, controllerRecipes.index)
routes.get("/criar", onlyUsers, controllerRecipes.create)
routes.get("/:index/editar", onlyUsers, controllerRecipes.edit)
routes.get("/:index", onlyUsers, controllerRecipes.show)

routes.post("/", onlyUsers, multer.array('photos', 5), validator.post, controllerRecipes.post)
routes.put("/", onlyUsers, multer.array('photos', 5), validator.put, controllerRecipes.put)
routes.delete("/", onlyUsers, controllerRecipes.delete)

module.exports = routes