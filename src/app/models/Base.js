const db = require('../../config/db')

function find(filters, table){
  try {
    let query = `SELECT * FROM ${table}`

    if(filters){
      Object.keys(filters).map(key => {
        //WHERE | OR | AND
        query += ` ${key}`
        Object.keys(filters[key]).map(field => {
          query += ` ${field} = '${filters[key][field]}'`
        })
      })
    }

    return db.query(query)

  } catch (error) {
    console.log(error)
  }
}

const Base = {
  init({table}){
    if(!table) throw new Error('Invalid Params')

    this.table = table

    return this
  },
  async find(id){
    try {
      const results = await find({where: {id}}, this.table)

      return results.rows[0]

    } catch (error) {
      console.log(error)
    }
  },
  async findOne(filters){
    try {
      const results = await find(filters, this.table)

      return results.rows[0]

    } catch (error) {
      console.log(error)
    }
  },
  async findAll(filters){
    try {
      const results = await find(filters, this.table)

      return results.rows

    } catch (error) {
      console.log(error)
    }
  },
  async create(fields){
    try {
      let keys = [],
          values = [],
          numbers = []
      
      Object.keys(fields).map((key, index, array) => {
        keys.push(key)
        values.push(fields[key])

        if(index < array.length) {
          numbers.push(`$${index + 1}`)
        }
      })

      const query = `INSERT INTO ${this.table} (${keys.join(',')})
        VALUES (${numbers.join(',')})
        RETURNING id
      `

      const results = await db.query(query, values)

      return results.rows[0].id

    } catch (error) {
      console.error(error)
    }
  },
  update(id, fields){
    try {
      let keys = [],
          values = []

      Object.keys(fields).map(key => {
        keys.push(key)
        values.push(fields[key])
      })

      const testeCampos = keys.map((key, index) => `${key} = '${values[index]}'`).join(",")

      let query = `UPDATE ${this.table} SET ${testeCampos} 
        WHERE id = ${id}
      `

      return db.query(query)

    } catch (error) {
      console.error(error)
    }
  },
  async delete(id){
    return await db.query(`DELETE FROM ${this.table} WHERE id = $1`, [id])
  }
}

module.exports = Base