const Recipe = require('../models/Recipe')

async function getImages(recipeId){
  let files = await Recipe.files(recipeId)

  files = files.map(file => ({
    ...file,
    src: `${file.path.replace("public", "")}`
  }))

  return files
}

async function formatImagesOneRecipe(recipe){
  const files = await getImages(recipe.id)
  
  recipe.files = files

  return recipe
}

async function formatImagesRecipes(recipes){
  return recipes = recipes.map(recipe => ({
    ...recipe,
    recipePhoto: `${recipe.file_path.replace("public", "")}`
  }))
}

const LoadService = {
  load(service, filters){
    this.filters = filters;
    return this[service]()
  },

  async recipe(){
    try {
      const recipe = await Recipe.findRecipe(this.filters)

      return formatImagesOneRecipe(recipe)

    } catch (error) {
      console.error(error)
    }
  },

  async recipes(){
    try {
      let recipes = await Recipe.allRecipes()

      return formatImagesRecipes(recipes)

    } catch (error) {
      console.error(error)
    }
  },

  async recipesOnlyUser(){
    try {
      const recipes = await Recipe.recipesOnlyUser(this.filters)

      return formatImagesRecipes(recipes)

    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = LoadService