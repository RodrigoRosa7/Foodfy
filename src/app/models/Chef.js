const db = require("../../config/db")

const Base = require('./Base')

Base.init({table: 'chefs'})

const Chefs = {
  ...Base,
  async allChefs(){
    try {
      const results = await db.query(`
        SELECT chefs.*, files.name AS avatar_name, files.path AS avatar_path
        FROM chefs
        LEFT JOIN files ON (chefs.file_id = files.id)
        GROUP BY chefs.id, files.id
        ORDER BY chefs.id
        `)

      return results.rows

    } catch (error) {
      console.log(error)
    }
  },
  async findChef(index) {
    try {
      const results = await db.query(`
        SELECT chefs.*, COUNT(recipes) AS total_recipes, files.name AS avatar_name, files.path AS avatar_path
        FROM chefs
        LEFT JOIN recipes ON (recipes.chef_id = chefs.id)
        LEFT JOIN files ON (chefs.file_id = files.id)
        WHERE chefs.id = $1
        GROUP BY chefs.id, files.id`, [index])

      return results.rows[0]

    } catch (error) {
      console.error(error)
    }
  },
  chefRecipes(id){
    try {
      return db.query(`
      SELECT recipes.*, chefs.name AS name_chef, single_file.path AS file_path
      FROM recipes
      LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
      LEFT JOIN (
        SELECT DISTINCT on (recipe_files.recipe_id) recipe_files.recipe_id, files.path
        FROM recipe_files
        JOIN files ON recipe_files.file_id = files.id
        ) single_file ON (single_file.recipe_id = recipes.id)
      WHERE chefs.id = $1
      ORDER BY recipes.created_at DESC`, [id])
      
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = Chefs