class TextField extends HTMLElement {
  state = new Proxy(
    {
      onload: false,
      /** @type { 'text' | 'textarea' | 'password' | 'phone' } */
      type: 'text',
      placeholder: '',
      value: '',
      pwVisible: false,
      isRequired: false,
      isClearable: false,
      isDisabled: false,
      isDense: false,
      isReadonly: false,
      onError: false,
      /** @type { null | number } */
      max: null,
    },
    {
      get: (target, props) => target[props],
      set: ((target, props, value) => {
        target[props] = value

        if (props === 'value') {
          this.onChange(value)
          this.validate()
          this.renderMax()
        }

        if (this.inputEl) {
          if (props === 'placeholder') {
            this.inputEl.placeholder = value
          }
        }

        if (props === 'pwVisible') {
          console.log(this)
          this.renderPassword()
          this.inputEl.type = value ? 'text' : 'password'
        }

        if (props === 'onError') {
          this.onChangeError(value)
        }

        if (props === 'readonly') {
          this.renderReadonly()
        }

        if (props === 'max') {
          this.renderMax()
        }

        if (props === 'native-name') {
          if (this.inputEl) {
            this.inputEl.name = value
          }
        }

        if (this.actionContainer) {
          if (
            Array.from(this.actionContainer.querySelectorAll('i')).some(
              (el) => document.defaultView.getComputedStyle(el).display === 'block',
            )
          ) {
            this.actionContainer.style.paddingLeft = '8px'
            this.actionContainer.style.paddingRight = '12px'
          } else {
            this.actionContainer.style.paddingLeft = ''
            this.actionContainer.style.paddingRight = ''
          }
        }

        if (props === 'isDisabled' && !!this.textField) {
          this.textField.classList?.[value ? 'add' : 'remove']('text-field__disabled')
        }

        if (this.inputEl) {
          this.inputEl.autocomplete = 'off'
        }

        return true
      }).bind(this),
    },
  )
  constructor() {
    super()

    this.__observe = false
  }
  static get observedAttributes() {
    return ['type', 'required', 'placeholder', 'clearable', 'disabled', 'dense', 'readonly', 'max', 'native-name']
  }
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'type':
      case 'placeholder':
      case 'max': {
        this.state[name] = newValue
        break
      }
      case 'required':
      case 'clearable':
      case 'disabled':
      case 'dense':
      case 'readonly': {
        this.state[`is${name.replace(/[a-z]/, (m) => m.toUpperCase())}`] = this.hasAttribute(name)
        break
      }
      case 'native-name': {
        this.state.nativeName = newValue
      }
    }
  }
  connectedCallback() {
    this.render()

    this.inputEl.addEventListener('input', this.onChangeInput.bind(this))
    if (this.state.max !== null) {
      this.inputEl.addEventListener('keydown', this.onKeydownInput.bind(this))
      this.inputEl.addEventListener('keyup', this.onKeyupInput.bind(this))
    }
  }
  disconnectedCallback() {
    this.inputEl.removeEventListener('input', this.onChangeInput)
    this.inputEl.removeEventListener('keydown', this.onKeydownInput)
    this.inputEl.removeEventListener('keyup', this.onKeyupInput)
  }

  get value() {
    return this.state.value
  }
  set value(val) {
    this.state.value = val
    this.inputEl.value = val
  }
  validate() {
    if (!this.state.isRequired) return true

    const val = !!this.state.value.trim()

    this.state.onError = !val

    return val
  }

  /* Render */
  render() {
    this.textField = document.createElement('label')
    this.textField.classList.add('text-field')
    if (this.state.isDense) {
      this.textField.classList.add('text-field__dense')
    }

    this.inputEl = document.createElement(this.state.type !== 'textarea' ? 'input' : 'textarea')
    if (this.state.type !== 'textarea') {
      this.inputEl.type = this.state.type
    }

    this.maxCountContainer = document.createElement('div')
    this.maxCount = document.createElement('div')
    this.maxCount.classList.add('text-field__max-count')
    this.currentCountEl = document.createElement('div')
    const maxCountSeparator = document.createElement('div')
    maxCountSeparator.innerText = '/'
    this.maxEl = document.createElement('div')

    this.maxCount.append(this.currentCountEl, maxCountSeparator, this.maxEl)
    this.maxCountContainer.append(this.maxCount)

    this.actionContainer = document.createElement('div')
    this.actionContainer.classList.add('text-field__action')

    this.clearEl = document.createElement('i')
    this.clearEl.innerText = 'cancel'
    this.clearEl.classList.add('text-field__action__clear', 'can-not-drag')
    this.clearEl.addEventListener('click', this.onClickClear.bind(this))

    this.passowrdEyeEl = document.createElement('i')
    this.passowrdEyeEl.classList.add('text-field__action__pw-eye', 'can-not-drag')
    this.passowrdEyeEl.addEventListener('click', this.onClickPwVisible.bind(this))

    this.errorIcon = document.createElement('i')
    this.errorIcon.innerText = 'error'
    this.errorIcon.classList.add('text-field__error__icon', 'can-not-drag')

    this.actionContainer.append(this.clearEl, this.passowrdEyeEl, this.errorIcon)

    if (this.state.isClearable || this.state.type === 'password') {
      this.actionContainer.style.paddingLeft = '8px'
      this.actionContainer.style.paddingRight = '12px'
    }

    this.textField.append(this.inputEl, this.maxCountContainer, this.actionContainer)
    this.append(this.textField)
    this.state.onload = true

    this.renderReadonly()
    this.renderPassword()
    this.renderMax()
    this.inputEl.placeholder = this.state.placeholder
    this.inputEl.name = this.state.nativeName

    if (this.state.isDisabled) {
      this.textField.classList.add('text-field__disabled')
    }
  }
  renderPassword() {
    if (!this.state.onload) return
    if (this.state.type !== 'password') return

    this.passowrdEyeEl.innerText = this.state.pwVisible ? 'visibility' : 'visibility_off'
  }
  renderReadonly() {
    if (!this.state.onload) return

    this.textField.classList?.[this.state.isReadonly ? 'add' : 'remove']('text-field__readonly')
    this.inputEl.readOnly = this.state.isReadonly
  }
  renderMax() {
    if (!this.state.onload) return
    if (this.state.max === null) return

    this.maxCount.style.display = 'flex'
    this.currentCountEl.innerText = this.state.value.length
    this.maxEl.innerText = this.state.max
  }

  /* Event */
  onChange(detail) {
    if (this.state.type === 'phone') {
      detail = detail
        .toString()
        .replace(/-/g, '')
        .replace(/[^0-9]/g, '')
        .replace(/(^02|^0505|^1[0-9]{3}|^0[0-9]{2})([0-9]+)?([0-9]{4})/, '$1-$2-$3')
        .replace('--', '-')

      if (detail.toString().length > 13) {
        detail = detail.slice(0, 13)
      }
      this.inputEl.value = detail
    }
    this.dispatchEvent(new Event('change', { bubbles: true, detail }))
  }
  onClickPwVisible() {
    this.state.pwVisible = !this.state.pwVisible
  }
  onClickClear() {
    this.state.value = ''
    this.inputEl.value = ''
  }
  /**
   * true면 에러 발생
   * @param {boolean} value
   */
  onChangeError(value) {
    this.textField.classList?.[value ? 'add' : 'remove']('text-field__error')
  }
  /** @param {InputEvent} e */
  onChangeInput(e) {
    this.state.value = e.target.value
  }

  /** @param {KeyboardEvent} e */
  onKeydownInput(e) {
    if (
      e.target.value.length >= this.state.max &&
      !(
        [
          'Backspace',
          'Delete',
          'Meta',
          'Control',
          'ArrowLeft',
          'ArrowUp',
          'ArrowRight',
          'ArrowDown',
          'Shift',
          'Home',
          'End',
        ].includes(e.key) ||
        (e.key === 'a' && (e.metaKey || e.ctrlKey))
      )
    ) {
      e.preventDefault()
    }
  }
  /** @param {KeyboardEvent} e */
  onKeyupInput(e) {
    const correctValue = (e.target.value || '').substring(0, this.state.max)
    this.inputEl.value = correctValue
    this.state.value = correctValue
  }
}

customElements.define('text-field', TextField)
