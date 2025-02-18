class ImageUpload extends HTMLElement {
  state = new Proxy(
      {
        value: null,
        max: 1024 * 1024 * 10,
      },
      {
        get: (target, props) => target[props],
        set: ((target, props, value) => {
          // 이전 파일 저장
          const prevFile = target.value

          target[props] = value

          if (props === 'value') {
            this.updatePreview(value) // state.value가 설정될 때 preview를 업데이트
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
    if (name === 'max') {
      this.state[name] = Number(newValue)
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

    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    const size = bytes / Math.pow(1024, i)

    return `${Number(size.toFixed(2))}${units[i]}`
  }

  handleFileUpload(event) {
    const file = event.target.files[0]
    this.state.value = file // state.value에 파일 설정, 프록시의 set 트랩이 호출됨
  }

  updatePreview(file) {
    if (file) {
      if (file.size > this.state.max) {
        alert(`파일이 너무 큽니다. ${this.convertSize(this.state.max)} 이하의 파일을 업로드 해주세요.`)
        return
      }

      this.querySelector('.upload').classList.add('hidden')
      const preview = this.querySelector('.preview')
      preview.classList.remove('hidden')
      preview.innerHTML = ''
      const img = document.createElement('img')
      img.alt = '미리보기'
      img.classList.add('preview-image')

      const reader = new FileReader()

      if (file.url) {
        img.src = `${file.url}`
      } else {
        reader.onload = (e) => {
          img.src = e.target.result
        }
        reader.readAsDataURL(file)
      }

      // const deleteBtn = document.createElement('i')
      // deleteBtn.classList.add('image-delete__btn')
      // deleteBtn.innerText = 'delete'

      preview.appendChild(img)
      // preview.appendChild(deleteBtn)
      // deleteBtn.addEventListener('click', this.onClickFileItemDelete.bind(this))
    } else {
      const preview = this.querySelector('.preview')
      preview.innerHTML = ''
      preview.classList.add('hidden')
      this.querySelector('.upload').classList.remove('hidden')
    }
  }

  onClickFileItemDelete(e) {
    e.preventDefault()
    e.stopPropagation()
    this.state.value = null
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

    const file = e.dataTransfer.files[0]
    this.state.value = file
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
}

customElements.define('image-upload', ImageUpload)
