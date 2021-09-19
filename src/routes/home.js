const express = require('express')
const routes = express.Router()
const controllerSite = require('../app/controllers/site')

routes.get('/home', controllerSite.indexRecipes)
routes.get('/sobre', controllerSite.about)
routes.get('/receitas', controllerSite.recipes)
routes.get('/receita/:index', controllerSite.show)
routes.get('/chefs', controllerSite.indexChefs)
routes.get('/chefs/:index', controllerSite.showChef)
routes.get('/receitas_filtradas', controllerSite.filter)

module.exports = routes