const fs = require('fs')
const {date} = require("../../lib/utils")
const Recipe = require('../models/Recipe')
const File = require('../models/File')
const User = require("../models/User")

const LoadRecipesService = require('../services/LoadRecipesService')

module.exports = {
  async index(req, res){
    try {
      const {userId: id} = req.session
      const user = await User.findOne({where: {id}})

      let recipes

      if(user.is_admin){
        recipes = await LoadRecipesService.load('recipes')
      } else {
        recipes = await LoadRecipesService.load('recipesOnlyUser', user.id)
      }

      if(!recipes) return res.render('admin/recipes/index')

      const { error, success } = req.session
      req.session.error = ''
      req.session.success = ''

      return res.render('admin/recipes/index', {recipes, error, success})
      
    } catch (error) {
      console.log(error)
    }
  },

  async create(req, res){
    try {
      const chefs = await Recipe.ChefSelectOptions()
      
      res.render('admin/recipes/create', {chefsOptions: chefs})

    } catch (error) {
      console.log(error)
    }
  },

  async edit(req, res){
    try {
      //Valida se usuário tem acesso a Editar
      const {userId: id} = req.session
      const user = await User.findOne({where: {id}})
      const chefs = await Recipe.ChefSelectOptions()
      const recipe = await LoadRecipesService.load('recipe', req.params.index)

      if(!recipe) return res.send("Receita não encontrada!")

      if(recipe.user_id != user.id && !user.is_admin){
        return res.redirect('/admin/receitas')
      }

      return res.render('admin/recipes/edit', {recipe, chefsOptions: chefs})

    } catch (error) {
      console.log(error)
    }
  },

  async show(req, res){
    try {
      //validação se usuário logado pode editar a receita
      const {userId: id} = req.session
      const user = await User.findOne({where: {id}})
      const recipe = await LoadRecipesService.load('recipe', req.params.index)

      let canUserEdit = false

      if(recipe.user_id == req.session.userId || user.is_admin){
        canUserEdit = true
      }

      const { error, success } = req.session
      req.session.error = ''
      req.session.success = ''

      return res.render(`admin/recipes/show`, {recipe, canUserEdit, error, success})

    } catch (error) {
      console.log(error)

      req.session.error = `Erro inesperado ocorreu! Erro: ${error}`

      return res.redirect(`/admin/receitas/`)
    }
  },

  async post(req, res){
    try {
      const keys = Object.keys(req.body)

      for (const key of keys) {
        if(req.body[key] == "")
          return res.send("Preencha todos os campos corretamente")
      }

      if(req.files.length == 0){
        return res.send('Por favor inclua pelo menos uma imagem')
      }

      req.body.userId = req.session.userId

      const {chef: chef_id, title, ingredients, preparations, information, userId: user_id} = req.body
      const created_at = date(Date.now()).iso
      const update_at = date(Date.now()).iso

      const recipeId = await Recipe.create({
        chef_id,
        title,
        ingredients: `{${ingredients}}`,
        preparations: `{${preparations}}`,
        information,
        created_at,
        update_at,
        user_id
      })

      const filesPromises  = req.files.map(file => File.create({name: file.filename, path: file.path}))

      let filesResults = await Promise.all(filesPromises)

      const recipeFilesPromises = filesResults.map(file => {
        const fileId = file

        File.createRecipeFiles({fileId, recipeId})
      })
      await Promise.all(recipeFilesPromises)

      req.session.success = 'Receita cadastrada com sucesso!'

      return res.redirect(`/admin/receitas/${recipeId}`)

    } catch (error) {
      console.log(error)

      req.session.error = `Erro inesperado ocorreu! Erro: ${error}`

      return res.redirect(`/admin/receitas/`)
    }
  },

  async put(req, res){
    try {
      const keys = Object.keys(req.body)

      for (const key of keys) {
        if(req.body[key] == "" && key != "removed_files")
          return res.send("Preencha todos os campos corretamente")
      }

      let {chef: chef_id, title, ingredients, preparations, information, id} = req.body
      const update_at = date(Date.now()).iso

      await Recipe.update(id, {
        chef_id,
        title,
        ingredients: `{${ingredients}}`,
        preparations: `{${preparations}}`,
        information,
        update_at
      })

      if(req.body.removed_files){
        const removedFiles = req.body.removed_files.split(",")
        const lastIndex = removedFiles.length - 1
        removedFiles.splice(lastIndex, 1)

        //get images to remove
        let allFilesPromise = removedFiles.map(FileId => File.find(FileId))
        let files = await Promise.all(allFilesPromise)

        files.map(file => {
          fs.unlinkSync(file.path)

          File.deleteRecipeFiles(file.id, id)
        })
      }

      if(req.files.length > 0){
        const oldFiles = await Recipe.files(req.body.id)
        const totalFiles = oldFiles.length + req.files.length

        if(totalFiles <= 5){
          const filesPromises = req.files.map(file => File.create({name: file.filename, path: file.path}))
          let filesResults = await Promise.all(filesPromises)
          
          const recipeFilesPromises = filesResults.map(file => {
            const fileId = file
      
            File.createRecipeFiles({fileId, recipeId: id})
          })
          await Promise.all(recipeFilesPromises)
        }        
      }

      req.session.success = 'Receita atualizada com sucesso!'
      
      return res.redirect(`/admin/receitas/${id}`)

    } catch (error) {
      console.log(error)
      
      req.session.error = `Erro inesperado ocorreu! Erro: ${error}`
      
      return res.redirect(`/admin/receitas/`)
    }
  },

  async delete(req, res) {
    try {
      const results =  await Recipe.RecipeFiles(req.body.id)
      let recipeFiles = results.rows

      //get images to remove
      let allFilesPromise = recipeFiles.map(recipeFile => File.find(recipeFile.file_id))
      let files = await Promise.all(allFilesPromise)

      files.map(file => {
        fs.unlinkSync(file.path)

        File.deleteRecipeFiles(file.id, req.body.id)
      })

      await Recipe.delete(req.body.id)

      req.session.success = 'Receita excluída com sucesso!'

      return res.redirect("/admin/receitas")

    } catch (error) {
      console.log(error)

      req.session.success = `Erro inesperado ocorreu! Erro: ${error}`

      return res.redirect("/admin/receitas")
    }
  }
}