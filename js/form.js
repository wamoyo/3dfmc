// Pure: extracts form field values into a plain object
// Input: form element -> Output: object with field name/value pairs
function getFormData (form) {
  var data = {}
  var elements = form.elements
  for (var i = 0; i < elements.length; i++) {
    var el = elements[i]
    if (el.name && el.type !== 'submit') {
      data[el.name] = el.value.trim()
    }
  }
  return data
}

// Pure: validates a single field
// Input: field name, value -> Output: error message string or empty string
function validateField (name, value) {
  if (name === 'name') {
    if (!value) return 'Name is required'
    if (value.length < 2) return 'Name must be at least 2 characters'
  }
  if (name === 'email') {
    if (!value) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address'
  }
  if (name === 'diameter') {
    if (!value) return 'Please select a filament diameter'
  }
  return ''
}

// Pure: validates all required fields
// Input: form data object -> Output: { valid: bool, errors: { fieldName: errorMsg } }
function validateForm (data) {
  var requiredFields = ['name', 'email', 'diameter']
  var errors = {}
  var valid = true

  requiredFields.forEach(function (field) {
    var error = validateField(field, data[field])
    if (error) {
      errors[field] = error
      valid = false
    }
  })

  return { valid: valid, errors: errors }
}

// Pure: checks if honeypot field is filled (bot detection)
// Input: form data object -> Output: boolean
function isHoneypotFilled (data) {
  return !!data.website
}

// Pure: checks if form was submitted too fast (bot detection)
// Input: timestamp number -> Output: boolean (true if too fast)
function isSubmittedTooFast (loadTime) {
  return (Date.now() - loadTime) < 5000
}

// Side effect: displays error state on a form field
function showFieldError (fieldName, message) {
  var field = document.querySelector('[name="' + fieldName + '"]')
  if (!field) return
  var group = field.closest('.form-group')
  if (!group) return
  group.classList.add('error')
  var errorText = group.querySelector('.form-error-text')
  if (errorText) {
    errorText.textContent = message
  }
}

// Side effect: clears all field error states
function clearFieldErrors () {
  var groups = document.querySelectorAll('.form-group.error')
  groups.forEach(function (group) {
    group.classList.remove('error')
    var errorText = group.querySelector('.form-error-text')
    if (errorText) {
      errorText.textContent = ''
    }
  })
}

// Side effect: shows success or error message banner
function showFormMessage (type, message) {
  var el = document.getElementById('form-message')
  if (!el) return
  el.className = 'form-message ' + type
  el.textContent = message
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

// Side effect: sends form data to Lambda endpoint
// Input: url string, data object -> Output: Promise
function submitToServer (url, data) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(function (response) {
    if (!response.ok) {
      throw new Error('Server responded with ' + response.status)
    }
    return response.json()
  })
}

// Side effect: handles form submission - validates, checks spam, submits
function handleSubmit (event) {
  event.preventDefault()

  var form = event.target
  var data = getFormData(form)
  var loadTime = parseInt(document.getElementById('form-loaded-at').value, 10)

  clearFieldErrors()

  // Silent spam traps - show fake success, never reveal detection
  if (isHoneypotFilled(data)) {
    showFormMessage('success', 'Thank you! Your quote request has been submitted.')
    form.reset()
    return
  }

  if (isSubmittedTooFast(loadTime)) {
    showFormMessage('success', 'Thank you! Your quote request has been submitted.')
    form.reset()
    return
  }

  var result = validateForm(data)

  if (!result.valid) {
    Object.keys(result.errors).forEach(function (field) {
      showFieldError(field, result.errors[field])
    })
    showFormMessage('error', 'Please fix the errors below and try again.')
    return
  }

  var submitBtn = form.querySelector('button[type="submit"]')
  var originalText = submitBtn.textContent
  submitBtn.disabled = true
  submitBtn.textContent = 'Submitting...'

  var url = form.getAttribute('data-action')

  // Remove honeypot and timestamp from submitted data
  var submitData = getFormData(form)
  delete submitData.website
  delete submitData.form_loaded_at

  submitToServer(url, submitData)
    .then(function () {
      showFormMessage('success', 'Thank you! Your quote request has been submitted. We will be in touch soon.')
      form.reset()
    })
    .catch(function () {
      showFormMessage('error', 'Something went wrong. Please try again or contact us directly at 330-854-3010.')
    })
    .finally(function () {
      submitBtn.disabled = false
      submitBtn.textContent = originalText
    })
}

// Side effect: initializes form - sets timestamp, wires submit listener
function initForm () {
  var form = document.getElementById('quote-form')
  if (!form) return

  document.getElementById('form-loaded-at').value = Date.now()

  form.addEventListener('submit', handleSubmit)
}

document.addEventListener('DOMContentLoaded', initForm)
