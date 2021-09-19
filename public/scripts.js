const recipes = document.querySelectorAll('.recipe')
const recipesAdmin = document.querySelectorAll('.recipeAdmin')
const recipesContent = document.querySelectorAll('.recipe-content')

for (let recipe of recipes){
  recipe.addEventListener('click', function(){
    const recipeId = recipe.getAttribute('id')
    window.location.href = `/receita/${recipeId}`
  })
}

for (let recipe of recipesAdmin){
  recipe.addEventListener('click', function(){
    const recipeId = recipe.getAttribute('id')
    window.location.href = `/admin/receitas/${recipeId}`
  })
}

for (let recipeContent of recipesContent) {
  let btn = recipeContent.querySelector('h6')
  let recipeChangeClass = recipeContent.querySelector('.info-content')
  
  btn.addEventListener('click', function(){
    if(btn.innerHTML === 'ESCONDER'){
      
      btn.innerHTML = 'MOSTRAR'

      recipeChangeClass.classList.remove('visible')
      recipeChangeClass.classList.add('hidden')

    } else if (btn.innerHTML === 'MOSTRAR'){
      
      btn.innerHTML = 'ESCONDER'
      recipeChangeClass.classList.add('visible')
      recipeChangeClass.classList.remove('hidden')
      
    }
  })
}

//Adiciona novo ingrediente
function addIngredient() {
  const ingredients = document.querySelector("#ingredients");
  const fieldContainer = document.querySelectorAll(".ingredient");

  // Realiza um clone do último ingrediente adicionado
  const newField = fieldContainer[fieldContainer.length - 1].cloneNode(true);

  // Não adiciona um novo input se o último tem um valor vazio
  if (newField.children[0].value == "") return false;

  // Deixa o valor do input vazio
  newField.children[0].value = "";
  ingredients.appendChild(newField);
}

const ingredient = document.querySelector(".add-ingredient")

if(ingredient) {
  ingredient.addEventListener("click", addIngredient);
}

//Adiciona novo passo
function addPreparation() {
  const preparations = document.querySelector("#preparations");
  const fieldContainer = document.querySelectorAll(".preparation");

  // Realiza um clone do último passo adicionado
  const newField = fieldContainer[fieldContainer.length - 1].cloneNode(true);

  // Não adiciona um novo input se o último tem um valor vazio
  if (newField.children[0].value == "") return false;

  // Deixa o valor do input vazio
  newField.children[0].value = "";
  preparations.appendChild(newField);
}

const preparation = document.querySelector(".add-preparation")

if(preparation) {
  preparation.addEventListener("click", addPreparation);
}


/* Pagination */

function paginate(selectedPage, totalPages){
  let pages = [],
  oldPage

  for(let currentPage = 1; currentPage <= totalPages; currentPage++) {
    const firstAndLastPage = currentPage == 1 || currentPage == totalPages
    const pagesAfterSelectedPage = currentPage <= selectedPage + 2
    const pagesBeforeSelectedPage = currentPage >= selectedPage - 2

    if(firstAndLastPage || pagesAfterSelectedPage && pagesBeforeSelectedPage){
      if(oldPage && currentPage - oldPage > 2) {
        pages.push("...")
      }

      if(oldPage && currentPage - oldPage == 2){
        pages.push(oldPage + 1)
      }

      pages.push(currentPage)

      oldPage = currentPage
    }
  }

  return pages
}

const pagination = document.querySelector(".pagination")

if(pagination){
  const filter = pagination.dataset.filter
  //o + na frente é para converter para número o que vem em string do front.
  const page = +pagination.dataset.page
  const total = +pagination.dataset.total

  const pages = paginate(page, total)

  let elements = ""

  for(let page of pages){
    if(String(page).includes("...")){
      elements += `<span>${page}</span>`

    } else {
      if(filter){
        elements += `<a href="?page=${page}&filter=${filter}">${page}</a>`

      } else {
        elements += `<a href="?page=${page}">${page}</a>`

      }
    }
    
  }

  pagination.innerHTML = elements
}

//Image Gallery
const ImageGallerySite = {
  highlight: document.querySelector('.gallery .highlight > img'),
  previews: document.querySelectorAll('.gallery-preview img'),

  setImage(e) {
    const {target} = e

    ImageGallerySite.previews.forEach(preview => preview.classList.remove('active'))
    target.classList.add('active')

    ImageGallerySite.highlight.src = target.src
    ImageGallerySite.highlight.alt = target.alt
  }
}