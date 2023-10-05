const textarea = document.getElementById('message-box')
const maxRows = 4 // Set the maximum number of rows

textarea.addEventListener('input', () => {
    const lines = textarea.value.split('\n')
    const rowCount = lines.length

    if (rowCount <= maxRows) {
        textarea.style.height = 'auto' // Reset the height to auto
        textarea.style.height = `${textarea.scrollHeight}px` // Set the height to match the content
    }
})

// Send the message to the server
document.addEventListener('DOMContentLoaded', function () {
    const messageBox = document.getElementById('message-box')
    const messageForm = document.getElementById('message-form')

    // Add event listener to the form (for the button)
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault()
        sendMessage()
    })

    // Add event listener to the textarea for Enter key press
    messageBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault() // Prevent Enter key from adding a new line
            sendMessage()
        }
    })

    function sendMessage() {
        const message = messageBox.value
        if (message.trim() === '') {
            return // Don't send empty messages
        }

        // Send the message to the server using fetch
        fetch('/send-message', {
            method: 'POST', // Change to the appropriate HTTP method
            body: JSON.stringify({ message }), // Send the message as JSON or in your preferred format
            headers: {
                'Content-Type': 'application/json', // Set the content type based on your server's expectations
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok')
                }
                return response.json()
            })
            .then((data) => {
                // Handle the response from the server (if needed)
                console.log('Message received')
                const messageDiv = document.createElement('div')
                messageDiv.className = 'message answer'
                messageDiv.textContent = data.content

                // Get the conversation container element
                const conversationContainer = document.getElementById('conversation')

                // Append the new message <div> to the conversation container
                conversationContainer.appendChild(messageDiv)
            })
            .catch((error) => {
                console.error('Error:', error)
            })

        // Clear the textarea after sending
        messageBox.value = ''
    }
})