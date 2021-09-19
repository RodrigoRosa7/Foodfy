const crypto = require('crypto')
const {hash} = require('bcryptjs')
const User = require('../models/User')
const mailer = require('../../lib/mailer')

module.exports = {
  loginForm(req, res){
    return res.render('session/login')
  },

  login(req, res){
    try {
      req.session.userId = req.user.id

      req.session.success = 'Login efetuado com sucesso!'

      return res.redirect('/admin/profile')

    } catch (error) {
      console.error(error)

      req.session.error = `Erro inesperado ocorreu! Erro: ${error}`

      return res.redirect('/admin/profile')
    }
  },
  
  logout(req, res){
    try {
      req.session.destroy()

      return res.redirect("/admin/users/login")

    } catch (error) {
      console.error(error)

      req.session.error = `Erro inesperado ocorreu! Erro: ${error}`

      return res.redirect('/admin/profile')
    }
  },

  forgotForm(req, res){
    return res.render('session/forgot-password')
  },

  async forgot(req, res) {
    try {
      const user = req.user
    
      //create token
      const token = crypto.randomBytes(20).toString("hex")

      //expiration token
      let now = new Date()
      now = now.setHours(now.getHours() + 1)

      await User.update(user.id, {
        reset_token: token,
        reset_token_expires: now
      })

      //send email with link for new password
      await mailer.sendMail({
        to: user.email,
        from: 'no-reply@foodfy.com.br',
        subject: 'Recuperação de senha',
        html: `<h2>Perdeu a senha?</h2>
        <p>Não se preocupe, clique no link abaixo para recuperar sua senha</p>
        <p>
          <a href="http://localhost:3000/admin/users/password-reset?token=${token}" target="_blank">
            Recuperar senha
          </a>
        </p>
        `
      })

      //user notification that email is sended
      return res.render('session/forgot-password', {
        success: "Verifique seu email para resetar sua senha!"
      })
    } catch (error) {
      console.error(error)
      return res.render('session/forgot-password', {
        error: "Erro inesperado, tente novamente!"
      })
    }
  },

  async resetForm(req, res){
    return res.render('session/reset-password', {token: req.query.token})
  },

  async reset(req, res){
    const {user} = req
    const {password, token} = req.body

    try {
      //cria uma nova hash
      const newPassword = await hash(password, 8)

      //atualiza o cadastro do usuário
      await User.update(user.id,{
        password: newPassword,
        reset_token: "",
        reset_token_expires: ""
      })

      //notifica o usuário 
      return res.render("session/login",{
        user: req.body,
        success: "Senha atualizada com sucesso!"
      })

    } catch (error) {
      console.error(error)
      return res.render("session/password-reset", {
        user: req.body,
        token,
        error: "Erro inesperado, tente novamente!"
      })
    }
  }
}