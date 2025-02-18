class ImageUpload extends HTMLElement {
  state = new Proxy(
    {
      value: null,
      max: 1000 * 1000 * 10,
    },
    {
      get: (target, props) => target[props],
      set: ((target, props, value) => {
        target[props] = value

        if (props === 'value') {
          this.renderPreview(value)
        }

        if (props === 'max') {
          this.render()
        }

        return true
      }).bind(this),
    },
  )

  constructor() {
    super()
  }
  static get observedAttributes() {
    return ['max']
  }
  connectedCallback() {
    this.render()
  }
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'max': {
        this.state[name] = Number(newValue)
        break
      }
    }
  }
  disconnectedCallback() {}
  render() {
    this.innerHTML = ''
    this.container = document.createElement('label')
    this.container.classList.add('image-upload__container')

    const inputEl = document.createElement('input')
    inputEl.type = 'file'
    inputEl.accept = 'image/*'
    inputEl.max = this.max
    inputEl.addEventListener('change', this.handleFileUpload.bind(this))

    const upload = document.createElement('div')
    upload.classList.add('image-upload__box', 'upload')

    const icon = document.createElement('i')
    icon.classList.add('image-upload__icon', 'material-icons')
    icon.innerText = 'upload'

    const innerText = document.createElement('span')
    innerText.classList.add('image-upload__text')
    innerText.innerText = '이미지를 업로드 해주세요.'

    this.container.addEventListener('drop', this.onDrop.bind(this))
    this.container.addEventListener('dragover', this.onDragOver.bind(this))
    this.container.addEventListener('dragleave', this.onDragLeave.bind(this))
    upload.append(icon, innerText)

    const preview = document.createElement('div')
    preview.classList.add('image-upload__box', 'preview', 'hidden')

    const desc = document.createElement('p')
    desc.classList.add('image-upload__desc')
    // desc.innerText = '최대 10MB 까지 등록가능합니다.'

    this.container.append(inputEl, upload, preview, desc)

    this.append(this.container)
  }

  convertSize(bytes) {
    if (bytes === 0) return '0'

    const units = ['B', 'KB', 'MB', 'GB', 'TB']

    const i = Math.floor(Math.log(bytes) / Math.log(1000))
    const size = bytes / Math.pow(1000, i)

    return `${Number(size.toFixed(2))}${units[i]}`
  }

  handleFileUpload(event) {
    const file = event.target.files[0]

    this.renderPreview(file)
  }
  renderPreview(file) {
    if (file) {
      if (file.size > this.state.max) {
        alert(`파일이 너무 큽니다. ${this.convertSize(this.state.max)} 이하의 파일을 업로드 해주세요.`)
        return
      }
      if (!file.type.startsWith('image/')) {
        alert('이미지 형식의 파일이 아닙니다. 확장자를 확인하여 업로드해주세요.')
        return
      }

      const reader = new FileReader()
      const preview = this.querySelector('.preview')
      const img = document.createElement('img')
      reader.onload = (e) => {
        this.querySelector('.upload').classList.add('hidden')
        preview.classList.remove('hidden')
        preview.innerHTML = ''

        img.src = e.target.result
        img.alt = '미리보기'
        img.classList.add('preview-image')

        preview.appendChild(img)
      }

      reader.readAsDataURL(file)
      // this.state.value = file

      const deleteBtn = document.createElement('i')
      deleteBtn.classList.add('image-delete__btn')
      deleteBtn.innerText = 'delete'

      preview.appendChild(img)
      preview.appendChild(deleteBtn)
      deleteBtn.addEventListener('click', this.onClickFileItemDelete.bind(this))
    } else {
      const preview = this.querySelector('.preview')
      preview.innerHTML = ''
      preview.classList.add('hidden')
      this.querySelector('.upload').classList.remove('hidden')
    }
  }
  /** @param {DragEvent} e */
  onDrop(e) {
    e.preventDefault()
    this.container.classList.remove('image-upload__drag-over')

    if (!e.dataTransfer.files.length) return
    if (e.dataTransfer.files.length > 1) {
      alert('파일은 한개만 등록 가능합니다.')
      return
    }

    this.renderPreview(e.dataTransfer.files[0])

    return
  }
  /** @param {DragEvent} e */
  onDragOver(e) {
    e.preventDefault()

    this.container.classList.add('image-upload__drag-over')
  }
  /** @param {DragEvent} e */
  onDragLeave(e) {
    e.preventDefault()

    this.container.classList.remove('image-upload__drag-over')
  }
  onClickFileItemDelete(e) {
    e.preventDefault()
    e.stopPropagation()
    this.state.value = null
  }
}

customElements.define('image-upload', ImageUpload)
