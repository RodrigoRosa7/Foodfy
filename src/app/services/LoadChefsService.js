const Chef = require('../models/Chef')

function formatAvatarChef(chef){
  if(chef.avatar_path != null){
    chef.avatar_path = `${chef.avatar_path.replace("public", "")}`
  }

  return chef
}

const LoadService = {
  load(service, filters){
    this.filters = filters
    return this[service]()
  },

  async chef(){
    try {
      let chef = await Chef.findChef(this.filters)

      chef = await formatAvatarChef(chef)

      let recipes = await Chef.chefRecipes(this.filters)
      
      chef.recipes = recipes.map(recipe => ({
        ...recipe,
        recipePhoto: `${recipe.file_path.replace("public", "")}`
      }))

      return chef

    } catch (error) {
      console.error(error)
    }
  },

  async chefs(){
    try {
      let chefs = await Chef.allChefs()

      chefs = chefs.map(chef =>({
        ...chef,
        avatar_path: `${chef.avatar_path.replace("public", "")}`
      }))

      return chefs
      
    } catch (error) {
      console.error(error) 
    }
  }
}

module.exports = LoadService