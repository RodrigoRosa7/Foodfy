const {date} = require("../../lib/utils")
const fs = require('fs')
const Chef = require('../models/Chef')
const File = require('../models/File')
const User = require('../models/User')

module.exports = {
  async index(req, res){
    try {
      let chefs = await Chef.allChefs()

      if(!chefs) return res.send("Não há chefs cadastrados")

      //valida se o usuário pode criar um novo chef
      const {userId: id} = req.session
      const user = await User.findOne({where: {id}})
      let canUserCreate = false

      if(user.is_admin){
        canUserCreate = true
      }

      chefs = chefs.map(chef =>({
        ...chef,
        avatar_path: `${req.protocol}://${req.headers.host}${chef.avatar_path.replace("public", "")}`
      }))

      const { error, success } = req.session
      req.session.error = ''
      req.session.success = ''

      return res.render('admin/chefs/index', {chefs, canUserCreate, error, success})
    } catch (error) {
      console.log(error)

      req.session.error = `Erro inesperado ocorreu! Erro: ${error}`

      return res.redirect(`/admin/chefs/`)
    }
  },

  create(req, res){
    return res.render('admin/chefs/create')
  },

  async show(req, res){
    try {
      let chef = await Chef.findChef(req.params.index)

      if(!chef) return res.send("Chef não encontrado!")

      //valida se o usuário pode clicar em Editar
      const {userId: id} = req.session
      const user = await User.findOne({where: {id}})
      let canUserEdit = false

      if(user.is_admin){
        canUserEdit = true
      }

      if(chef.avatar_path != null){
        chef.avatar_path = `${req.protocol}://${req.headers.host}${chef.avatar_path.replace("public", "")}`
      }

      results = await Chef.chefRecipes(req.params.index)
      let recipes = results.rows

      recipes = recipes.map(recipe => ({
        ...recipe,
        recipePhoto: `${req.protocol}://${req.headers.host}${recipe.file_path.replace("public", "")}`
      }))

      const { error, success } = req.session
      req.session.error = ''
      req.session.success = ''

      return res.render('admin/chefs/show', {chef, recipes, canUserEdit, error, success})

    } catch (error) {
      console.log(error)

      req.session.error = `Erro inesperado ocorreu! Erro: ${error}`

      return res.redirect(`/admin/chefs/`)
    }
  },

  async edit(req, res){
    try {
      let chef = await Chef.findChef(req.params.index)

      if(!chef) return res.send("Chef não encontrado!")

      //Valida se usuário tem acesso a Editar
      const {userId: id} = req.session
      const user = await User.findOne({where: {id}})
      
      if(!user.is_admin){
        return res.redirect('/admin/chefs')
      }

      return res.render('admin/chefs/edit', {chef})

    } catch (error) {
      console.log(error) 
    }
  },

  async post(req, res) {
    try {
      const keys = Object.keys(req.body)

      for (const key of keys) {
        if(req.body[key] == "")
          return res.send("Preencha todos os campos corretamente")
      }

      if(!req.file){
        return res.send("Por favor inclua o avatar do chef")
      }

      const {name} = req.body
      const created_at = date(Date.now()).iso

      const file = req.file
      const {filename, path} = {...file}
      const fileResult = await File.create({name: filename, path})

      const chefId = await Chef.create({
        name, 
        created_at, 
        file_id: fileResult
      })

      req.session.success = 'Chef cadastrado com sucesso!'

      return res.redirect(`/admin/chefs/${chefId}`)
      
    } catch (error) {
      console.log(error)

      req.session.error = `Erro inesperado ocorreu! Erro: ${error}`

      return res.redirect(`/admin/chefs/`)
    }
  },

  async put(req, res){
    try {
      const keys = Object.keys(req.body)

      for(const key of keys) {
        if(req.body[key] == "")
          return res.send("Preencha todos os campos corretamente")
      }

      const {name, id, file_id} = req.body

      if(req.file){
        const file = req.file

        const {filename, path} = {...file}
        const fileResult = await File.create({name: filename, path})

        await Chef.update(id,{name, file_id: fileResult})
        
        //deleta o avatar anterior
        if(req.body.file_id != ""){
          const chefAvatar = await File.find(req.body.file_id)

          fs.unlinkSync(chefAvatar.path)
          
          await File.delete(req.body.file_id)
        }

      } else {
        //se não alterou o avatar mantem o mesmo
        await Chef.update(id, {name, file_id})

      }

      req.session.success = 'Chef atualizado com sucesso!'

      return res.redirect(`/admin/chefs/${req.body.id}`)

    } catch (error) {
      console.log(error)

      req.session.error = `Erro inesperado ocorreu! Erro: ${error}`

      return res.redirect(`/admin/chefs/`)
    }
  },

  async delete(req, res){
    try {
      const chef = await Chef.findChef(req.body.id)
      
      if(chef.total_recipes > 0) return res.send("Não é possível excluir chef com receitas atreladas")

      await Chef.delete(req.body.id)
      
      const chefAvatar = await File.find(chef.file_id)
      fs.unlinkSync(chefAvatar.path)
      await File.delete(chef.file_id)

      req.session.success = 'Chef deletado com sucesso!'

      return res.redirect('/admin/chefs')

    } catch (error) {
      console.log(error)

      req.session.error = `Erro inesperado ocorreu! Erro: ${error}`

      return res.redirect(`/admin/chefs/`)
    }
  }
}