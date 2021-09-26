const Recipe = require('../models/Recipe')
const LoadRecipesService = require('../services/LoadRecipesService')
const LoadChefsService = require('../services/LoadChefsService')

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
      const recipe = await LoadRecipesService.load('recipe', req.params.index)

      if(!recipe) return res.send("Receita não encontrada!")

      return res.render('site/recipe', {item: recipe})

    } catch (error) {
      console.log(error)
    }
  },

  async indexChefs(req, res){
    try {
      let chefs = await LoadChefsService.load('chefs')

      if(!chefs) return res.send("Não há chefs cadastrados")

      return res.render('site/chefs', {chefs})

    } catch (error) {
      console.log(error)
    }
  },

  async showChef(req, res){
    try {
      const chef = await LoadChefsService.load('chef', req.params.index)

      if(!chef) return res.send("Chef não encontrado")

      return res.render('site/chef', {chef})

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