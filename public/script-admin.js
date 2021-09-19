/* PHOTOS UPLOAD */

const PhotosUpload = {
  preview: document.querySelector('#photos-preview'),
  uploadLimit: 5,
  files: [],
  input: "",
  handleFileInput(event){
    const {files: fileList} = event.target
    PhotosUpload.input = event.target

    if(PhotosUpload.hasLimit(event)) {
      PhotosUpload.updateInputFiles()
      
      return
    } 

    Array.from(fileList).forEach(file => {
      PhotosUpload.files.push(file)

      const reader = new FileReader()

      reader.readAsDataURL(file)

      reader.onload = () => {
        const image = new Image()
        image.src = String(reader.result)

        const div = PhotosUpload.getContainer(image)

        PhotosUpload.preview.appendChild(div)
      }
    })
    PhotosUpload.updateInputFiles() 
  },
  hasLimit(event){
    const {uploadLimit, preview} = PhotosUpload
    const {files: fileList} = PhotosUpload.input

    if(fileList.length > uploadLimit){
      alert(`Envie no máximo ${uploadLimit} fotos`)
      event.preventDefault()
      return true
    }

    const photoDiv = []
    preview.childNodes.forEach(item => {
      if(item.classList && item.classList.value == "photo"){
        photoDiv.push(item)
      }
    })

    const totalPhotos = fileList.length + photoDiv.length
    if(totalPhotos > uploadLimit){
      alert('Você atingiu o limite máximo de imagens')
      event.preventDefault()
      return true
    }

    return false
  },
  getAllFiles(){
    const dataTransfer = new ClipboardEvent("").clipboardData || new DataTransfer()

    PhotosUpload.files.forEach(file => dataTransfer.items.add(file))

    return dataTransfer.files
  },
  getContainer(image) {
    const div = document.createElement('div')
    div.classList.add('photo')
    //já está passando o event como parâmetro desta forma
    div.onclick = PhotosUpload.removePhoto
    div.appendChild(image)

    div.appendChild(PhotosUpload.getRemoveButton())

    return div
  },
  getRemoveButton(){
    const button = document.createElement('i')
    button.classList.add('material-icons')
    button.innerHTML = 'delete'

    return button
  },
  removePhoto(event){
    const photoDiv = event.target.parentNode
    const newFiles = Array.from(PhotosUpload.preview.children).filter(file => {
      if(file.classList.contains('photo') && !file.getAttribute('id')) return true
    })

    const index = newFiles.indexOf(photoDiv)
    PhotosUpload.files.splice(index, 1)

    PhotosUpload.updateInputFiles() 

    newFiles[index].remove()
  },
  removeOldPhoto(event){
    const photoDiv = event.target.parentNode

    if(photoDiv.id){
      const removedFiles = document.querySelector('input[name="removed_files"]')

      if(removedFiles){
        removedFiles.value += `${photoDiv.id},`
      }
    }

    photoDiv.remove()
  },
  updateInputFiles(){
    PhotosUpload.input.files = PhotosUpload.getAllFiles() 
  }
}

const ImageGallery = {
  highlight: document.querySelector('.gallery .highlight > img'),
  previews: document.querySelectorAll('.gallery-preview img'),

  setImage(e) {
    const {target} = e

    ImageGallery.previews.forEach(preview => preview.classList.remove('active'))
    target.classList.add('active')

    ImageGallery.highlight.src = target.src
    ImageGallery.highlight.alt = target.alt
  }
}

const ChefAvatar = {
  preview: document.querySelector('#avatar-chef'),
  // input: document.querySelector('photo'),
  uploadLimit: 1,
  handleAvatarInput(event){
    const photoDiv = document.querySelector('.photo')
    const {files: fileList} = event.target
    
    if(photoDiv){
      photoDiv.remove()
    }

    if(ChefAvatar.hasLimit(event)) return
    
    const div = ChefAvatar.getContainer(fileList)
    ChefAvatar.preview.appendChild(div)
  },

  getContainer(fileList){
    const div = document.createElement('div')
    div.classList.add('photo')
    const input = document.createElement('input')
    input.type = "text"
    input.name = "avatar_chef"
    input.value = fileList[0].name
    input.style.marginBottom = "15px"
    div.appendChild(input)
    
    return div
  },

  hasLimit(event){
    const {uploadLimit, preview} = ChefAvatar
    const {files: fileList} = event.target
    // const input = document.querySelector('#avatar-chef input')

    if(fileList.length > uploadLimit){
      alert(`Envie no máximo ${uploadLimit} fotos`)
      event.preventDefault()
      return true
    }

    // if(input.value == null){
    //   input.value = fileList[0].name
    //   return false
    // }

    // if(preview.childNodes == 1){
    //   input.value = fileList[0].name
    // }

    const photoDiv = []
    preview.childNodes.forEach(item => {
      if(item.classList && item.classList.value == "photo"){
        photoDiv.push(item)
      }
    })

    const totalPhotos = fileList.length + photoDiv.length
    if(totalPhotos > uploadLimit){
      alert('Você atingiu o limite máximo de imagens')
      event.preventDefault()
      return true
    }

    return false
  },
}

const Validate = {
  apply(input, func) {
    Validate.clearErrors(input)

    let results = Validate[func](input.value)
    
    input.value = results.value

    if(results.error)
      Validate.displayError(input, results.error)
  },

  displayError(input, error){
    const div = document.createElement('div')
    div.classList.add('error')
    div.innerHTML = error

    input.parentNode.appendChild(div)
    input.focus()
  },

  clearErrors(input){
    const errorDiv = input.parentNode.querySelector('.error')

    if(errorDiv)
      errorDiv.remove()
  },

  isEmail(value){
    let error = null

    const mailFormat = /^\w+([\.]?\w+)*@\w+([\.]?\w+)*(\.\w{2,3})+$/

    if(!value.match(mailFormat))
      error = "Email inválido"

    return {
      error,
      value
    }
  }
}