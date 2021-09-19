const express = require('express')
const routes = express.Router()
const {onlyUsers} = require('../app/middlewares/session')
const ProfileValidator = require('../app/validators/profile')
const ProfileController = require('../app/controllers/profile')


routes.get('/', onlyUsers, ProfileController.show)
routes.put('/', ProfileValidator.update, ProfileController.update)

module.exports = routes