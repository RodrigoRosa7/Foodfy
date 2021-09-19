const User = require("../models/User")

module.exports = {
  async show(req, res){
    try {
      const {userId: id} = req.session

      const user = await User.findOne({where: {id}})

      if(!user) return res.render('user/register', {
        error: "Usuário não encontrado!"
      })

      const { error, success } = req.session

      if(user.is_admin){
        const users = await User.findAll()

        req.session.error = ''
        req.session.success = ''

        return res.render('user/index', {users, error, success})
      }
      
      req.session.error = ''
      req.session.success = ''

      return res.render('user/show', {user, error, success})

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