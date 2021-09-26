const db = require('../../config/db')

const Base = require('./Base')

Base.init({table: 'recipes'})

const Recipes = {
  ...Base,
  async allRecipes(){
    try {
      const results = await db.query(`
      SELECT recipes.*, chefs.name AS name_chef, single_file.path AS file_path
      FROM recipes
      LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
      LEFT JOIN (
        SELECT DISTINCT on (recipe_files.recipe_id) recipe_files.recipe_id, files.path
        FROM recipe_files
        JOIN files ON recipe_files.file_id = files.id
        ) single_file ON (single_file.recipe_id = recipes.id)
      ORDER BY recipes.created_at DESC`)
      
      return results.rows 
       
    } catch (error) {
      console.log(error)
    }
  },
  async recipesOnlyUser(id){
    try {
      const results = await db.query(`
      SELECT recipes.*, chefs.name AS name_chef, single_file.path AS file_path
      FROM recipes
      LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
      LEFT JOIN (
        SELECT DISTINCT on (recipe_files.recipe_id) recipe_files.recipe_id, files.path
        FROM recipe_files
        JOIN files ON recipe_files.file_id = files.id
        ) single_file ON (single_file.recipe_id = recipes.id)
      WHERE user_id = ${id}`)

      return results.rows

    } catch (error) {
      console.log(error)
    }
  },
  async ChefSelectOptions(){
    try {
      const results = await db.query("SELECT id, name FROM chefs ORDER BY chefs.name")
      
      return results.rows
      
    } catch (error) {
      console.log(error)
    }
  },
  async findRecipe(index){
    try {
      const results = await db.query(`
      SELECT recipes.*, chefs.name AS name_chef 
      FROM recipes 
      LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
      WHERE recipes.id = $1`, [index])

      return results.rows[0]

    } catch (error) {
      console.log(error)
    }
  },
  async files(id){
    try {
      const results = await db.query(`
      SELECT files.*, recipe_id
      FROM files
      LEFT JOIN recipe_files ON (files.id = recipe_files.file_id)
      WHERE recipe_id = $1
      `, [id])
      
      return results.rows

    } catch (error) {
      console.log(error)
    }
  },
  async recipeWithIdFiles(id){
    try {
      const results = await db.query(`
      SELECT recipes.*, recipe_id, file_id
      FROM recipes
      LEFT JOIN recipe_files ON (recipes.id = recipe_files.recipe_id)
      WHERE recipes.user_id = $1`, [id])

      return results.rows

    } catch (error) {
      console.log(error)
    }
  },
  RecipeFiles(id){
    try {
      return db.query(`SELECT * FROM recipe_files WHERE recipe_id = $1`, [id])
      
    } catch (error) {
      console.log(error)
    }
  },
  findBy(params) {
    try {
      const {filter, limit, offset} = params

      let query = "",
          filterQuery = "",
          totalQuery = "(SELECT COUNT(*) FROM recipes) AS total"

      
      if(filter) {
        filterQuery = `
        WHERE recipes.title ILIKE '%${filter}%'
        `

        totalQuery = `(
        SELECT COUNT(*) FROM recipes
        ${filterQuery}
        ) AS total`
      }

      query = `
      SELECT recipes.*, ${totalQuery},
      chefs.name AS name_chef, single_file.path AS file_path
      FROM recipes
      LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
      LEFT JOIN (
        SELECT DISTINCT on (recipe_files.recipe_id) recipe_files.recipe_id, files.path
        FROM recipe_files
        JOIN files ON recipe_files.file_id = files.id
        ) single_file ON (single_file.recipe_id = recipes.id)
      ${filterQuery}
      ORDER BY recipes.update_at DESC
      LIMIT $1 OFFSET $2
      `

      return db.query(query, [limit, offset])

    } catch (error) {
      console.log(error)
    }
  },
  paginate(params){
    try {
      const {limit, offset} = params

      let query = `
      SELECT recipes.*, 
      (SELECT COUNT(*) FROM recipes) AS total, chefs.name AS name_chef, single_file.path AS file_path
      FROM recipes
      LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
      LEFT JOIN (
        SELECT DISTINCT on (recipe_files.recipe_id) recipe_files.recipe_id, files.path
        FROM recipe_files
        JOIN files ON recipe_files.file_id = files.id
        ) single_file ON (single_file.recipe_id = recipes.id)
      `
      query = `${query}
      ORDER BY recipes.created_at DESC
      LIMIT $1 OFFSET $2
      `
      return db.query(query, [limit, offset])

    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = Recipes