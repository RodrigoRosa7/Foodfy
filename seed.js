const faker = require('faker')
const {hash} = require('bcryptjs')
const User = require('./src/app/models/User')
const File = require('./src/app/models/File')
const Chef = require('./src/app/models/Chef')
const Recipe = require('./src/app/models/Recipe')

let usersIds = []
let chefsIds = []
let filesIds = []
let recipesIds = []

let totalUsers = 3
let totalChefs = 6
let totalRecipes = 8

async function creatUsers(){
  const users = []
  const password = await hash('123', 8)

  while(users.length < totalUsers){
    users.push({
      name: faker.name.firstName(),
      email: faker.internet.email(),
      is_admin: faker.datatype.boolean(),
      password
    })
  }

  const usersPromise = users.map(user => User.create(user))

  usersIds = await Promise.all(usersPromise)
}

async function createChefs(){
  let chefs = []
  let files = []

  while(files.length < totalChefs){
    files.push({
      name: faker.image.image(),
      path: `public/images/placeholderChefs.png`
    })
  }

  const filesPromise = files.map(file => File.create(file))
  filesIds = await Promise.all(filesPromise)

  let fileId = 0

  while(chefs.length < totalChefs){
    chefs.push({
      name: faker.name.firstName(),
      file_id: filesIds[fileId],
    })
    fileId++
  }

  const chefsPromise = chefs.map(chef => Chef.create(chef))
  chefsIds = await Promise.all(chefsPromise)
}

async function createRecipes(){
  const recipes = []
  let files = []
  let filesRecipes = []

  while(recipes.length < totalRecipes){
    recipes.push({
      chef_id: chefsIds[Math.floor(Math.random() * totalChefs)],
      title: faker.name.title(),
      ingredients: `{${[
        'massa pronta de lasanha',
        '400 g de presunto',
        '400 g de mussarela ralada',
        '2 copos de requeijão',
        '150 g de mussarela para gratinar',
      ]}}`,
      preparations: `{${[
        'Em uma panela, coloque a manteiga para derreter.',
        'Acrescente a farinha de trigo e misture bem com auxílio de um fouet.',
        'Adicione o leite e misture até formar um creme homogêneo.',
        'Tempere com sal, pimenta e noz-moscada a gosto.',
        'Desligue o fogo e acrescente o creme de leite; misture bem e reserve.',
      ]}}`,
      information: faker.lorem.paragraph(Math.ceil(Math.random() * 10)),
      user_id: usersIds[Math.floor(Math.random() * totalUsers)],
    })
  }

  const recipesPromise = recipes.map(recipe => Recipe.create(recipe))
  recipesIds = await Promise.all(recipesPromise)

  while(files.length < totalRecipes){
    files.push({
      name: faker.image.image(),
      path: `public/images/placeholder.png`
    })
  }

  const filesPromise = files.map(file => File.create(file))
  filesIds = await Promise.all(filesPromise)

  let fileRecipeId = 0

  while(filesRecipes.length < totalRecipes){
    filesRecipes.push({
      recipe_id: recipesIds[fileRecipeId],
      file_id: filesIds[fileRecipeId],
    })
    fileRecipeId++
  }

  const filesRecipesPromise = filesRecipes.map(
    fileRecipe => File.createRecipeFiles({fileId: fileRecipe.file_id, recipeId: fileRecipe.recipe_id}))
  
  await Promise.all(filesRecipesPromise)
}

async function init(){
  try {
    await creatUsers()
    await createChefs()
    await createRecipes()

    console.log("seeds geradas!")

  } catch (error) {
    console.log("erro ao gerar as seeds", error)
  }
}

init()