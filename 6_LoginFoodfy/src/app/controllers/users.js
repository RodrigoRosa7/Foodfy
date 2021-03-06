const User = require("../models/User")

module.exports = {
  create(req, res){
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

      return res.render('user/edit', {user})

    } catch (error) {
      console.log(error)
    }
  },

  async post(req, res){
    try {
      const userId = await User.create(req.body)

      req.session.userId = userId

      return res.redirect(`/admin/users/${userId}/editar`)

    } catch (error) {
      console.log(error)
    }
  },

  async update(req, res){
    try {
      const {user} = req
      let { name, email} = req.body

      await User.update(user.id, {
        name,
        email
      })

      return res.render('user/show', {
        user: req.body,
        success: 'Conta atualizada com sucesso!'
      })

    } catch (error) {
      console.error(error)
      return res.render('user/index', {
        error: 'Algum erro aconteceu!'
      })
    }
  }
}