const openButton = document.getElementById('add-contact')
const dialog = document.getElementById('addContactDialog')
const searchInput = document.getElementById('search-input')
const searchButton = document.getElementById('search-button')
const searchResults = document.getElementById('search-results')
const closeButton = document.getElementById('close-add-contact-dialog')

// Function to show the dialog
function openDialog() {
    dialog.style.display = 'block'
}

// Function to hide the dialog
function closeDialog() {
    dialog.style.display = 'none'
}

// Event listener to open the dialog
openButton.addEventListener('click', openDialog)

closeButton.addEventListener('click', closeDialog)

function displaySearchResults(usernames, searchQuery) {
    searchResults.innerHTML = '' // Clear the previous results

    const filteredUsernames = usernames.filter(username =>
        username.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (filteredUsernames.length === 0) {
        const noResultsMessage = document.createElement('p')
        noResultsMessage.textContent = 'No results found.'
        searchResults.appendChild(noResultsMessage)

        return
    }

    filteredUsernames.forEach(username => {
        const li = document.createElement('li')
        li.textContent = username
        li.classList.add('contact-search-result')
        searchResults.appendChild(li)
    })

}

searchInput.addEventListener('input', () => {
    const searchQuery = searchInput.value
    const filteredContacts = allContacts.filter(user => !currentContacts.includes(user))
    displaySearchResults(filteredContacts, searchQuery)
})

document.getElementById('search-results').addEventListener('click', (event) => {
    if (event.target && event.target.tagName === 'LI') {
        const selectedName = event.target.textContent
        fetchUser(selectedName)
    }
})

function fetchUser(username) {
    fetch('/add-user-to-contact-list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username })
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }

            const contactList = document.getElementById('contact-list')
            const li = document.createElement('li')
            li.textContent = username
            li.classList.add('contact-person')
            const lastChild = contactList.lastElementChild
            contactList.insertBefore(li, lastChild)
        })
        .catch((error) => {
            console.error('Error sending message:', error)
        })
}