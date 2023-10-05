const textarea = document.getElementById('message-box')
const maxRows = 4 // Set the maximum number of rows

// Get the conversation container element
const conversationContainer = document.getElementById('conversation')

function scrollToBottom() {
    conversationContainer.scrollTop = conversationContainer.scrollHeight;
}

function resizeTextarea() {
    const lines = textarea.value.split('\n')
    const rowCount = lines.length

    if (rowCount <= maxRows) {
        textarea.style.height = 'auto' // Reset the height to auto
        textarea.style.height = `${textarea.scrollHeight}px` // Set the height to match the content
    }

}
textarea.addEventListener('input', resizeTextarea)


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

        sendMessageToSocket(username, 'Wille', message)

        // Clear the textarea after sending
        messageBox.value = ''
        resizeTextarea()
    }
})

const socket = io({
    query: {
        username: username,
    },
})

// Send a message to another user
function sendMessageToSocket(sender, recipient, message) {
    socket.emit('message', { sender, recipient, message })
}

// Receive messages
socket.on('message', (responseData) => {
    // Display the received message in the chat interface
    const { sender, message } = responseData
    console.log(message)
    const messageDiv = document.createElement('div')
    messageDiv.className = 'message'
    messageDiv.innerHTML = message.replace(/\n/g, '<br>')


    if (sender === username) {
        // Sender is the same as current user
        messageDiv.classList.add('answer')

    }
    else {
        // Sender is not the current user    
        messageDiv.classList.add('respond')
    }

    // Append the new message <div> to the conversation container
    conversationContainer.appendChild(messageDiv)
    scrollToBottom()
})