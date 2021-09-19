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

async function update(req, res, next){
  const fillAllFields = checkAllFields(req.body)
  if(fillAllFields){
    return res.render('user/show', fillAllFields)
  }

  const {id, password} = req.body

  if(!password){
    return res.render('user/show', {
      user: req.body,
      error: 'Preencha sua senha para atualizar o cadastro!'
    })
  }

  const user = await User.findOne({where: {id}})

  const passed = await compare(password, user.password)

  if(!passed) return res.render('user/show', {
    user: req.body,
    error: 'Senha incorreta!'
  })

  req.user = user

  next()
}

module.exports = {
  update
}