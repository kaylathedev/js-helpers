String.prototype.toKebabCase = function() {
  return this.match(/[A-Z]{2,}(?=[A-Z][a-z0-9]*|\b)|[A-Z]?[a-z0-9]*|[A-Z]|[0-9]+/g)
    .filter(Boolean)
    .map(x => x.toLowerCase())
    .join('-')
}

Element.prototype.attr = function(name, value) {
  this.setAttribute(name, value)
  return this
}
Element.prototype.class = function(className) {
  if (className.includes(' ')) {
    const classNameList = className.split(' ')
    for (const classNameChild of classNameList) {
      this.classList.add(classNameChild)
    }
    return this
  }
  this.classList.add(className)
  return this
}
Element.prototype.clear = function() {
  this.childNodes.forEach(x => x.remove())
  this.innerHTML = ''
  return this
}
Element.prototype.create = function(type, options) {
  if (type === undefined) {
    type = 'div'
  } else if (typeof type === 'object') {
    options = type
    type = 'div'
  }
  const child = document.createElement(type)
  this.appendChild(child)
  if (typeof options === 'object') {
    child.set(options)
  }
  return child
}
Element.prototype.createAtBeginning = function(type) {
  const child = document.createElement(type)
  this.prepend(child)
  return child
}
Element.prototype.createInput = function(options) {
  const container = this.create().class('input-field')

  let labelText = options.label

  let inputTagName = 'input'
  let inputName = options.name
  let inputType = 'text'

  let label
  if (labelText !== undefined) {
    label = container.create('label').text(labelText)

    if (inputName === undefined) {
      inputName = labelText.toKebabCase()
    }
  }

  if (options.type) {
    switch (options.type) {
      case 'tel':
      case 'phone':
        inputType = 'tel'
        break
      case 'select':
        inputTagName = 'select'
        inputType = undefined
        break
      case 'textarea':
        inputTagName = 'textarea'
        inputType = undefined
        break
      default:
        inputType = options.type
    }
  }

  const input = container.create(inputTagName)
  if (inputType) input.type = inputType
  if (inputName) input.name = inputName
  input.label = label
  return input
}
Element.prototype.each = function(cb) {
  for (let i = 0; i < this.children.length; i++) {
    cb(this.children[i], i)
  }
  return this
}
Element.prototype.find = function(selector) {
  const element = this.querySelector(selector)
  if (element === null) {
    throw new Error('No element found with selector: ' + selector)
  }
  return element
}
Element.prototype.findMany = function(selector) {
  const elements = this.querySelectorAll(selector)
  return new UiElements(elements)
}
Element.prototype.getValue = function() {
  if (this.constructor === HTMLSelectElement) {
    if (this.multiple) {
      const values = []
      for (const option of this.selectedOptions) {
        values.push(option.value)
      }
      return values
    }
  }
  if (this.constructor === HTMLInputElement) {
    if (this.type === 'date') {
      return new Date(this.value + ' 00:00:00')
    }
  }
  return this.value
}
Element.prototype.hide = function() {
  this._oldStyleDisplay = this.style.display
  this.style.display = 'none'
  return this
}
Element.prototype.html = function(html) {
  this.innerHTML = html
  return this
}
Element.prototype.on = function(event, handler) {
  this['on' + event] = handler
  //this.addEventListener(event, handler)
  return this
}
Element.prototype.removeClass = function(className) {
  this.classList.remove(className)
  return this
}
Element.prototype.set = function(a, b) {
  if (typeof a === 'object' && b === undefined) {
    for (const key in a) {
      const value = a[key]
      if (key === 'text') {
        this.innerText = value
      } else if (key === 'html') {
        this.innerHTML = value
      } else if (key === 'class') {
        this.className += ' ' + value
      } else {
        this[key] = value
      }
    }
  } else {
    if (a === 'text') {
      this.innerText = b
    } else if (a === 'html') {
      this.innerHTML = b
    } else if (a === 'class') {
      this.className += ' ' + b
    } else {
      this[a] = b
    }
  }
  return this
}
Element.prototype.show = function() {
  this.style.display = this._oldStyleDisplay !== undefined ? this._oldStyleDisplay : ''
  return this
}
Element.prototype.text = function(text) {
  this.innerText = text
  return this
}
Element.prototype.vibrate = function(durationInMs) {
  const oldRight = this.style.right
  const halfPulseDuration = 30
  const startMs = Date.now()
  const endMs = startMs + durationInMs - halfPulseDuration
  let movedRight = false
  const moveFunction = () => {
    if (movedRight) {
      this.style.right = '-10px'
    } else {
      this.style.right = '10px'
    }
    const now = Date.now()
    if (now >= endMs) {
      this.style.right = oldRight
      return
    }
    movedRight = !movedRight
    setTimeout(moveFunction, halfPulseDuration)
  }
  moveFunction()
  return this
}
Element.prototype.with = function(cb) {
  cb(this)
  return this
}
Object.defineProperty(Element.prototype, 'parent', {
  get: function() {
    return this.parentElement
  }
})

HTMLFormElement.prototype.getInputs = function() {
  const elements = this.elements
  const inputs = {}
  for (const element of elements) {
    const name = element.name
    if (name) {
      if (element.constructor === HTMLSelectElement && element.multiple) {
        const values = []
        for (const option of element.selectedOptions) {
          values.push(option.value)
        }
        inputs[name] = values
      } else if (element.constructor === HTMLInputElement) {
        if (element.type === 'date') {
          inputs[name] = new Date(element.value + ' 00:00:00')
        }
      } else {
        const value = element.value
        inputs[name] = value
      }
    }
  }
  return inputs
}
SubmitEvent.prototype.getInputs = function() {
  const form = this.target
  return form.getInputs()
}

HTMLSelectElement.prototype.getSelectedValues = function() {
  if (this.multiple) {
    const values = []
    for (const option of this.selectedOptions) {
      values.push(option.value)
    }
    return values
  }
  return [element.value]
}
HTMLSelectElement.prototype.setSelectedOption = function(option) {
  this.setSelectedOptions([option])
}
HTMLSelectElement.prototype.setSelectedOptions = function(options) {
  if (!Array.isArray(options)) options = [options]
  const optionElements = this.getElementsByTagName('option')
  for (const optionElement of optionElements) {
    const optionValue = optionElement.value
    if (options.includes(optionValue)) {
      optionElement.selected = true
    }
  }
}

class Ui {
  static find(selector) {
    const element = document.querySelector(selector)
    if (element === null) {
      throw new Error('No element found with selector: ' + selector)
    }
    return element
  }
  static findMany(selector) {
    return document.querySelectorAll(selector)
  }
  static createFullscreenPopup() {
    const backing = document.createElement('div')
    backing.classList.add('fullscreen-popup-backing')

    const element = document.createElement('div')
    element.classList.add('fullscreen-popup')
    element.classList.add('popup')

    backing.appendChild(element)

    const container = document.getElementById('popups')
    if (!container) {
      document.body.prepend(backing)
    } else {
      container.appendChild(backing)
    }

    element.backing = backing

    element.createButton = function() {
      if (this.buttonsElement === undefined) {
        this.buttonsElement = document.createElement('div')
        this.buttonsElement.classList.add('buttons')
        this.appendChild(this.buttonsElement)
      }
      return this.buttonsElement.create('button')
    }
    element.remove = function() {
      this.backing.parentElement.removeChild(this.backing)
    }
    element.setDismissible = function(value) {
      this._dismissible = value
      this.backing.onclick = e => {
        if (e.target === this.backing) {
          if (value) {
            this.remove()
          } else {
            this.vibrate(400)
          }
        }
      }
      return this
    }
    element.setTitle = function(title) {
      let titleUi
      try {
        titleUi = this.find('.title')
      } catch (e) {
        titleUi = this.createAtBeginning('div').class('popup-title')
      }
      titleUi.text(title)
      return this
    }
    element.setDismissible(true)
    return element
  }
}
