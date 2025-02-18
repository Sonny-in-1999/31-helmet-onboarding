/**
 * @typedef ItemType
 * @type {Object}
 * @property { string } label
 * @property { string } value
 */

/**
 * @typedef OptionType
 * @type {Array<ItemType>}
 */

/**
 * @typedef OutputType
 * @type {Object}
 * @property { ItemType } value
 */

class DropdownSelect extends HTMLElement {
  state = new Proxy(
    {
      ticking: false,
      onFocus: false,
      isDense: false,
      /** @type { OptionType }  */
      options: [],
      /** @type { OutputType } */
      output: { label: '', value: '' },
      isRequired: false,
      placeholder: '',
      clearable: false,
      onError: false,
      /** @type { string | undefined } */
      default: undefined,
    },
    {
      get: (target, props) => target[props],
      set: (target, props, value) => {
        target[props] = value

        if (props === 'options') {
          this.renderOptions()
        }

        if (props === 'output') {
          if (value === 'reset') {
            target.output = {
              label: '',
              value: '',
            }

            if (this.state.placeholder) {
              this.renderPlaceholder()
            } else {
              this.renderValue()
            }
          } else {
            this.renderValue()
          }

          this.validate()
          this.dispatchEvent(new Event('change', { bubbles: true, detail: this.state.output }))
        }

        if (props === 'onError') {
          this.onChangeError(value)
        }

        return true
      },
    },
  )

  constructor(...args) {
    super(...args)

    this.tabIndex = 0
    this.classList.add('dropdown-select')

    const slot = this.querySelector('template[slot]')
    if (slot?.content) {
      this.state.options = Array.from(slot.content.children).map((cur) => ({
        label: cur.innerText.trim(),
        value: cur.dataset.value.trim(),
      }))
      slot.remove()
    }

    this.__observe = false
  }
  static get observedAttributes() {
    return ['required', 'placeholder', 'clearable', 'disabled', 'dense', 'default']
  }
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'dense': {
        this.state.isDense = this.hasAttribute('dense')
        this.classList?.[this.state.isDense ? 'add' : 'remove']('dropdown-select__dense')
        break
      }
      case 'required': {
        this.state.isRequired = this.hasAttribute('required')
        break
      }
      case 'placeholder': {
        this.state.placeholder = newValue || ''
        break
      }
      case 'clearable': {
        this.state.clearable = this.hasAttribute('clearable')

        if (this.state.clearable) {
          if (!this.clearableEl?.classList.contains('dropdown-select__actions__clear')) {
            this.renderClearable()
          }
        }
        break
      }
      case 'disabled': {
        this.state.isDisabled = this.hasAttribute('disabled')
        this.classList?.[this.state.isDisabled ? 'add' : 'remove']('dropdown-select__disabled')
        break
      }
      case 'default': {
        this.state.default = this.getAttribute('default')
        break
      }
    }
  }
  get value() {
    return this.state.output
  }
  set value(val) {
    const foundValue = this.state.options.find((el) => el.value === val)

    if (!foundValue) {
      console.error(new Error(`'${val}'은/는 options 목록에 없습니다.`))
      return
    }

    this.state.output = foundValue
  }
  validate() {
    if (!this.state.isRequired) return true

    const val = !!this.state.output.value.trim()

    this.state.onError = !val

    return val
  }
  /** @param {Event} e */
  scrollEvent(e) {
    if (!this.state.ticking) {
      window.requestAnimationFrame(
        function () {
          this.updateMenuPosition()

          this.state.ticking = false
        }.bind(this),
      )

      this.state.ticking = true
    }
  }
  onClickBlur(e) {
    if (!(this.contains(e.target) || this.menu.contains(e.target))) {
      this.menu.style.display = 'none'
      this.state.onFocus = false
      this.classList.remove('dropdown-select__focus')
      this.blur()
    }
  }
  connectedCallback() {
    this.__observe = true
    this.render()
    this.menu.style.width = this.width

    this.scrollableParents = this.getScrollableParents(this)

    this.scrollableParents.forEach((el) => {
      el.addEventListener('scroll', this.scrollEvent.bind(this))
    })

    this.addEventListener('focus', this.onFocusDropdown.bind(this))
    window.addEventListener('click', this.onClickBlur.bind(this))
  }
  disconnectedCallback() {
    this.scrollableParents.forEach((el) => {
      el.removeEventListener('scroll', this.scrollEvent)
    })
    this.inputContainer.removeEventListener('load', this.dropdownOnload)
    this.removeEventListener('focus', this.onFocusDropdown)
    window.removeEventListener('click', this.onClickBlur)
  }
  render() {
    this.inputContainer = document.createElement('div')
    this.inputContainer.classList.add('dropdown-select__content')
    this.valueSection = document.createElement('span')

    if (this.state.placeholder) {
      this.renderPlaceholder()
    }

    this.inputContainer.append(this.valueSection)

    if (this.state.clearable) {
      this.renderClearable()
    }

    this.moreIcon = document.createElement('span')
    this.moreIcon.innerText = 'play_arrow'
    this.moreIcon.classList.add('dropdown-select__indicator', 'can-not-drag')

    this.errorIcon = document.createElement('i')
    this.errorIcon.innerText = 'error'
    this.errorIcon.classList.add('dropdown-select__error__icon', 'can-not-drag')

    this.menu = document.createElement('div')
    this.menu.classList.add('dropdown-select__menu')
    this.renderOptions()

    this.append(this.inputContainer)
    if (this.state.clearable) {
      this.append(this.clearableEl)
    }
    this.append(this.moreIcon, this.errorIcon)
    document.body.append(this.menu)

    if (this.state.default) {
      const findDefault = this.state.options.find((el) => el.value === this.state.default)

      if (findDefault) {
        this.state.output = findDefault
      }
    }
  }
  onClickOption(e) {
    e.stopPropagation()
    this.state.output = {
      label: e.target.innerText,
      value: e.target.dataset.value,
    }
    this.onClickBlur({})
  }
  renderOptions() {
    if (!this.menu) return

    Array.from(this.menu.children).forEach((el) => el.removeEventListener('click', this.onClickOption))

    const items = this.state.options.map((el) => {
      const item = document.createElement('div')
      item.classList.add('dropdown-select__menu__item')
      item.addEventListener('click', this.onClickOption.bind(this))

      item.dataset.value = el.value
      item.innerText = el.label

      return item
    })
    this.menu.append(...items)
  }
  updateMenuPosition() {
    const { left, top, width, height } = this.getClientRects()[0]

    this.menu.style.left = `${left}px`
    this.menu.style.top = `${top + height}px`
    this.menu.style.width = `${width- 16}px`
  }
  renderValue() {
    this.valueSection.classList.remove('placeholder')
    this.valueSection.innerText = this.state.output.label
  }
  renderPlaceholder() {
    this.valueSection.classList.add('placeholder')
    this.valueSection.innerText = this.state.placeholder
  }
  renderClearable() {
    this.clearableEl = document.createElement('div')
    this.clearableEl.classList.add('dropdown-select__actions__clear')
    this.clearableEl.innerHTML = `<i class="material-icons">cancel</i>`
    this.clearableEl.addEventListener(
      'click',
      function (e) {
        e.preventDefault()
        e.stopPropagation()
        this.state.output = 'reset'
      }.bind(this),
    )
  }
  isScrollable(element) {
    const hasScrollableContent =
      element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth
    const overflowYStyle = window.getComputedStyle(element).overflowY
    const overflowXStyle = window.getComputedStyle(element).overflowX
    const isOverflowHidden =
      (overflowYStyle !== 'visible' && overflowYStyle !== 'hidden') ||
      (overflowXStyle !== 'visible' && overflowXStyle !== 'hidden')

    return hasScrollableContent && isOverflowHidden
  }

  getScrollableParents(element) {
    const scrollableParents = []
    let parent = element.parentElement

    while (parent) {
      if (this.isScrollable(parent)) {
        scrollableParents.push(parent)
      }
      parent = parent.parentElement
    }

    return scrollableParents
  }
  /**
   * true면 에러 발생
   * @param {boolean} value
   */
  onChangeError(value) {
    this.classList?.[value ? 'add' : 'remove']('dropdown-select__error')
  }

  onFocusDropdown() {
    if (this.state.isDisabled) return
    this.menu.style.display = 'block'
    this.updateMenuPosition()
    this.state.onFocus = true
    this.classList.add('dropdown-select__focus')
  }
}

customElements.define('dropdown-select', DropdownSelect)
