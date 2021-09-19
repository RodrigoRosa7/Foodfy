const Recipe = require('../models/Recipe')
const Chef = require('../models/Chef')

module.exports = {
  async indexRecipes(req, res){
    try {
      const results = await Recipe.allRecipes()
      let recipesMostViews = []

      if(!results){
        return res.render('site/index', {items: recipesMostViews})
      }
      
      for(let i = 0; i < 6; i++){
        const obj = results[i]
        recipesMostViews.push(obj)
      }

      recipesMostViews = recipesMostViews.map(recipe => ({
        ...recipe,
        recipePhoto: `${req.protocol}://${req.headers.host}${recipe.file_path.replace("public", "")}`
      }))

      return res.render('site/index', {items: recipesMostViews})

    } catch (error) {
      console.log(error)
    }
  },

  about(req, res){
    return res.render('site/about')
  },

  async recipes(req, res){
    try {
      let {page, limit} = req.query

      page = page || 1
      limit = limit || 2
      let offset = limit * (page - 1)

      const params = {
        page,
        limit,
        offset
      }
      
      const results = await Recipe.paginate(params)
      let recipes = results.rows

      if(recipes.length === 0) {
        return res.render('site/recipes', {items: recipes})
      }

      recipes = recipes.map(recipe => ({
        ...recipe,
        recipePhoto: `${req.protocol}://${req.headers.host}${recipe.file_path.replace("public", "")}`
      }))

      const pagination = {
        page,
        total: Math.ceil(recipes[0].total / limit)
      }
        
      return res.render('site/recipes', {items: recipes, pagination})

    } catch (error) {
      console.log(error)
    }
  },

  async show(req, res){
    try {
      const recipe = await Recipe.findRecipe(req.params.index)

      if(!recipe) return res.send("Receita não encontrada!")

      let files = await Recipe.files(recipe.id)

      files = files.map(file => ({
        ...file,
        src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
      }))

      return res.render('site/recipe', {item: recipe, files})

    } catch (error) {
      console.log(error)
    }
  },

  async indexChefs(req, res){
    try {
      let chefs = await Chef.allChefs()

      if(!chefs) return res.send("Não há chefs cadastrados")

      chefs = chefs.map(chef =>({
        ...chef,
        avatar_path: `${req.protocol}://${req.headers.host}${chef.avatar_path.replace("public", "")}`
      }))

      return res.render('site/chefs', {chefs})

    } catch (error) {
      console.log(error)
    }
  },

  async showChef(req, res){
    try {
      let chef = await Chef.findChef(req.params.index)

      if(!chef) return res.send("Chef não encontrado")

      if(chef.avatar_path != null){
        chef.avatar_path = `${req.protocol}://${req.headers.host}${chef.avatar_path.replace("public", "")}`
      }

      results = await Chef.chefRecipes(req.params.index)
      let recipes = results.rows

      recipes = recipes.map(recipe => ({
        ...recipe,
        recipePhoto: `${req.protocol}://${req.headers.host}${recipe.file_path.replace("public", "")}`
      }))

      return res.render('site/chef', {chef, recipes})

    } catch (error) {
      console.log(error)
    }
  },

  async filter(req, res){
    try {
      let {filter, page, limit} = req.query

      page = page || 1
      limit = limit || 2
      let offset = limit * (page - 1)

      const params = {
        filter,
        page,
        limit,
        offset
      }

      const results = await Recipe.findBy(params)
      let filteredRecipes = results.rows

      if(filteredRecipes[0]){
      const pagination = {
        total: Math.ceil(filteredRecipes[0].total / limit),
        page
      }

      filteredRecipes = filteredRecipes.map(recipe => ({
        ...recipe,
        recipePhoto: `${req.protocol}://${req.headers.host}${recipe.file_path.replace("public", "")}`
      }))

      return res.render('site/filterRecipes', {items: filteredRecipes, pagination, filter})

      } else {
        return res.render('site/filterNotFound', {filter})
      }

    } catch (error) {
      console.log(error)
    }
  }
}