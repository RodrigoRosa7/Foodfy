const express = require('express')
const routes = express.Router()

const SessionController = require('../app/controllers/session')
const UserController = require('../app/controllers/users')
const UserValidator = require('../app/validators/user')
const SessionValidator = require('../app/validators/session')
const {isLogged} = require('../app/middlewares/session')

// Login/logout
routes.get('/login', isLogged, SessionController.loginForm)
routes.post('/login', SessionValidator.login, SessionController.login)
routes.post('/logout', SessionController.logout)

// forgot password / reset password
routes.get('/forgot-password', SessionController.forgotForm)
routes.post('/forgot-password', SessionValidator.forgot, SessionController.forgot)
routes.get('/password-reset', SessionController.resetForm)
routes.post('/password-reset', SessionValidator.reset, SessionController.reset)

// user register UserController
routes.get('/register', UserController.create)
routes.post('/register', UserValidator.post, UserController.post)
routes.get("/:index/editar", UserValidator.edit, UserController.edit)
routes.put('/:index', UserValidator.update, UserController.put)
routes.delete('/', UserController.delete)

module.exports = routes