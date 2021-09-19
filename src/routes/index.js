const express = require('express')
const routes = express.Router()
const {isLogged} = require('../app/middlewares/session')

//Home
const home = require('./home')
routes.use('', home)

//Profile
const profile = require('./profile')
routes.use('/admin/profile', profile)

//Users
const users = require('./users')
routes.use('/admin/users', users)

//Recipes
const recipes = require('./recipes')
routes.use('/admin/receitas', recipes)

//Chefs
const chefs = require('./chefs')
routes.use('/admin/chefs', chefs)

//Site
routes.get('/',function(req, res){
  return res.redirect("/home")
})

//Alias
routes.get('/accounts', isLogged, function(req, res){
  return res.redirect('/admin/users/login')
})


module.exports = routes