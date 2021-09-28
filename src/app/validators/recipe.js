async function post(req, res, next) {
  try {
    const keys = Object.keys(req.body)

    for (const key of keys) {
      if(req.body[key] == "")
        return res.send("Preencha todos os campos corretamente")
    }
    
    if(req.files.length == 0){
      return res.send('Por favor inclua pelo menos uma imagem')
    }

    next()

  } catch (error) {
    console.error(error)
  }
} 

async function put(req, res, next){
  try {
    const keys = Object.keys(req.body)
   
    for (const key of keys) {
      if(req.body[key] == "" && key != "removed_files")
        return res.send("Preencha todos os campos corretamente")
    }

    next()

  } catch (error) {
    console.error(error)
  }
}

module.exports = {
  post,
  put
}
