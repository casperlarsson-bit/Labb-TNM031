const textarea = document.getElementById('message')
const maxRows = 4 // Set the maximum number of rows

textarea.addEventListener('input', () => {
    const lines = textarea.value.split('\n')
    const rowCount = lines.length

    if (rowCount <= maxRows) {
        textarea.style.height = 'auto' // Reset the height to auto
        textarea.style.height = `${textarea.scrollHeight}px` // Set the height to match the content
    }
})

