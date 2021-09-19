const User = require('../models/User')
const {compare} = require('bcryptjs')

function checkAllFields(body){
  const keys = Object.keys(body)

  for(key of keys){
    if(body[key] == ""){
      return {
        user: body,
        error: 'Por favor, preencha todos os campos!'
      }
    }
  }
}

//é um middleware
async function post (req, res, next){
  
  const fillAllFields = checkAllFields(req.body)
  if(fillAllFields){
    return res.render('user/register', fillAllFields)
  }

  let {email, isAdmin} = req.body


  const user = await User.findOne({where: {email}})

  if(user) {
    return res.render('user/register', {
      user: req.body,
      error: 'Usuário já cadastrado.'
    })
  }

  if(!isAdmin){
    req.body.isAdmin = false
  }

  next()
}

async function edit(req, res, next){
  const {userId: id} = req.session

  const user = await User.findOne({where: {id}})

  if(!user) return res.render('user/register', {
    error: "Usuário não encontrado!"
  })

  if(!user.is_admin){
    return res.redirect('/admin/profile/')
  }

  req.user = user

  next()
}

async function update(req, res, next){
  let userLogin
  
  if(req.session.userId) {
    let {userId: id} = req.session
    
    const user = await User.findOne({where: {id}})
    
    userLogin = user
  }

  const fillAllFields = checkAllFields(req.body)
  if(fillAllFields){
    return res.render('user/edit', fillAllFields)
  }

  const {id, password} = req.body

  if(!userLogin.is_admin && !password){
    return res.render('user/edit', {
      user: req.body,
      error: 'Preencha sua senha para atualizar o cadastro!'
    })
  }

  const user = await User.findOne({where: {id}})

  if(!userLogin.is_admin){
    const passed = await compare(password, user.password)

    if(!passed) return res.render('user/edit', {
      user: req.body,
      error: 'Senha incorreta!'
    })
  }

  req.user = user

  next()
}

module.exports = {
  post,
  edit,
  update
}