const db = require('../../config/db')

const Base = require('./Base')

Base.init({table: 'files'})

const File = {
  ...Base,
  createRecipeFiles({fileId, recipeId}){
    try {
      const query = `
      INSERT INTO recipe_files (
        file_id,
        recipe_id
      ) VALUES ($1, $2)
      RETURNING id
      `
      const values = [fileId, recipeId]

      return db.query(query, values)

    } catch (error) {
      console.error(error)
    }
  },
  async deleteRecipeFiles(fileId, recipeId){
    try {
      await db.query(`
        DELETE FROM recipe_files WHERE recipe_id = $1 AND file_id = $2
      `, [recipeId, fileId])
      return await db.query(`DELETE FROM files WHERE id = $1`, [fileId])
      
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = File