const {hash} = require('bcryptjs')
const {unlinkSync} = require('fs')
const crypto = require('crypto')
const mailer = require('../../lib/mailer')
const User = require("../models/User")
const Recipe = require('../models/Recipe')
const File = require('../models/File')


module.exports = {
  async create(req, res){
    //Valida se usuário tem acesso ao form de cadastro de usuário
    const {userId: id} = req.session
    const user = await User.findOne({where: {id}})
    
    if(!user.is_admin){
      return res.redirect('/admin/profile/')
    }
    
    return res.render('user/register')
  },

  async show(req, res){
    try {
      const {userId: id} = req.session

      const user = await User.findOne({where: {id}})

      if(!user) return res.render('user/register', {
        error: "Usuário não encontrado!"
      })

      return res.render('user/show', {user})

    } catch (error) {
      console.log(error)
    }
  },

  async edit(req, res){
    try {
      const {user} = req

      if(user.is_admin){
        const id = req.params.index

        const userFound = await User.findOne({where: {id}})

        return res.render('user/edit', {user: userFound})
      }

      return res.render('user/edit', {user})

    } catch (error) {
      console.log(error)
    }
  },

  async post(req, res){
    try {
      const {name, email, isAdmin: is_admin} = req.body

      //cria a senha
      const passwordEmail = crypto.randomBytes(6).toString("hex")

      //criptografa a senha para o banco de dados
      const password = await hash(passwordEmail, 8)

      await User.create({
        name, 
        email, 
        is_admin,
        password
      })

      //send email with link with the password
      await mailer.sendMail({
        to: email,
        from: 'no-reply@foodfy.com.br',
        subject: 'Seja bem vindo ao Foodfy',
        html: `<h2>Olá ${name},</h2>
        <p>
          Damos boas vindas, ao maior site de receitas do Brasil, 
          para ter acesso a sua conta utilize a senha gerada abaixo:
        </p>
        
        <h2>
          ${passwordEmail}
        <h2>

        <p>
          <a href="http://localhost:3000/admin/users/login" target="_blank">
            Faça seu login :)
          </a>
        </p>
        `
      })

      //user notification that email is sended
      req.session.success = 'Conta criada. Email com a senha enviado!'

      return res.redirect('/admin/profile/')

    } catch (error) {
      console.log(error)

      return res.render('user/register', {
        error: "Erro inesperado, tente novamente!"
      })
    }
  },

  async put(req, res){
    try {
      const {user} = req
      let { name, email, isAdmin} = req.body

      if(!isAdmin){
        isAdmin = false
      }

      await User.update(user.id, {
        name,
        email,
        is_admin: isAdmin
      })

      return res.render('user/edit', {
        user: req.body,
        success: 'Conta atualizada com sucesso!'
      })

    } catch (error) {
      console.error(error)
      return res.render('user/index', {
        error: 'Algum erro aconteceu!'
      })
    }
  },

  async delete(req, res){
    try {
      const recipes = await Recipe.recipeWithIdFiles(req.body.id)

      //get images
      let allFilesPromise = recipes.map(recipe => File.find(recipe.file_id))

      let files = await Promise.all(allFilesPromise)

      //delete user
      await User.delete(req.body.id)

      files.map(async file => {
        unlinkSync(file.path)
      })

      //remove images
      files.map(async file => {
        await File.delete(file.id)
      })
      
      req.session.success = 'Conta excluída com sucesso!'

      return res.redirect('/admin/profile/')
      
    } catch (error) {
      console.error(error)
      return res.render("user/edit", {
        user: req.body,
        error: "Erro ao tentar deletar a conta!"
      })
    }
  }
}