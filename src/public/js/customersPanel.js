document.querySelectorAll('.panel').forEach((panel) => {
  // Client Options Toggle
  panel.querySelectorAll('.client-data').forEach((element, i, arr) => {
    const toggleOptions = () => {
      arr.forEach((e) => e !== element && e.classList.remove('open'))
      element.classList.toggle('open')
    }
    element.addEventListener('click', toggleOptions)
    element.addEventListener('keydown', (e) => {
      console.log(e)
      if (e.key === 'Enter') toggleOptions()
    })
  })

  // Search Filtering
  const listItems = panel.querySelectorAll('.client-list-item')
  const itemsData = [...listItems].map((element) => {
    const name = element.querySelector('h3').innerText
    const email = element.querySelector('h4').innerText
    return { name, email }
  })

  const searchContainer = panel.querySelector('.search-bar')
  const input = searchContainer.querySelector('input')

  const filterQuery = () => {
    const searchTerm = input.value.trim()
    const regex = new RegExp(searchTerm, 'i')

    const filteredMap = itemsData.map(
      (item) => regex.test(item.name) || regex.test(item.email)
    )
    listItems.forEach((element, i) => {
      filteredMap[i]
        ? element.classList.remove('hidden')
        : element.classList.add('hidden')
    })
  }

  input.addEventListener('input', filterQuery)

  // Clear Search filter
  const clearButton = searchContainer.querySelector('.search-clear')

  const clearInput = () => {
    input.value = ''
    filterQuery()
  }

  clearButton.addEventListener('click', clearInput)
})
