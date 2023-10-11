const openButton = document.getElementById('add-contact')
const dialog = document.getElementById('addContactDialog')
const searchInput = document.getElementById('searchInput')
const searchButton = document.getElementById('searchButton')
const searchResults = document.getElementById('searchResults')

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