// Fetch Post
const updateValue = (key, value) => {
  return fetch(window.location.href, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      [key]: value
    })
  })
}

// Button Actions
const toggleButtons = (...buttons) => {
  buttons.forEach((button) => {
    if (!button.classList.contains('edit-loading')) {
      button.classList.toggle('hidden')
    }
  })
}

// Input actions
document.querySelectorAll('.customer-data-placeholder').forEach((element) => {
  const input = element.querySelector('input')
  const options = element.querySelector('input ~ .customer-data-options')
  const [editButton, submitButton, cancelButton, loading] =
    options.querySelectorAll('button')
  let value = ''

  editButton.addEventListener('click', () => {
    value = input.value
    input.disabled = false
    input.setSelectionRange(value.length, value.length)
    input.focus()
    toggleButtons(editButton, submitButton, cancelButton)
  })

  cancelButton.addEventListener('click', () => {
    input.value = value
    input.disabled = true
    toggleButtons(editButton, submitButton, cancelButton)
  })

  submitButton.addEventListener('click', () => {
    toggleButtons(submitButton, cancelButton, loading)
    updateValue(input.id.split('-').pop(), input.value)
      .then((res) => {
        if (!res.ok) {
          input.value = value
        }
      })
      .catch(() => {
        input.value = value
      })
      .finally(() => {
        input.disabled = true
        toggleButtons(editButton, loading)
      })
  })
})
