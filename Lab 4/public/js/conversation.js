const textarea = document.getElementById('message-box')
const maxRows = 4 // Set the maximum number of rows
let selectedRecipient = document.querySelector('.contact-person').innerHTML.trim() // Global variable to store the recipient

// Get the conversation container element
const conversationContainer = document.getElementById('conversation')

function scrollToBottom() {
    conversationContainer.scrollTop = conversationContainer.scrollHeight
}

function resizeTextarea() {
    const lines = textarea.value.split('\n')
    const rowCount = lines.length

    if (rowCount <= maxRows) {
        textarea.style.height = 'auto' // Reset the height to auto
        textarea.style.height = `${textarea.scrollHeight}px` // Set the height to match the content
    }

}

function displayMessage(sender, message, timestamp) {
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
    // To show the time of the message
    const timeMessageDiv = document.createElement('div')
    timeMessageDiv.className = 'time-message'
    const formattedTime = extractHoursAndMinutes(timestamp);
    timeMessageDiv.innerHTML = formattedTime;
    messageDiv.appendChild(timeMessageDiv);


    // Append the new message <div> to the conversation container
    conversationContainer.appendChild(messageDiv)
    scrollToBottom()
}

function extractHoursAndMinutes(timestamp) {
    console.log(timestamp)
    const dateObj = new Date(timestamp);
    
    const hours = dateObj.getUTCHours()+2;
    const minutes = dateObj.getUTCMinutes();

    // Pad single-digit minutes with a leading zero
    // if minuutes < 10 set a 0 in fron else do nothing
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${hours}:${paddedMinutes}`;
}

textarea.addEventListener('input', resizeTextarea)

document.getElementById('contact-list').addEventListener('click', (event) => {
    if (event.target && event.target.classList.contains('contact-person')) {
        selectedRecipient = event.target.textContent.trim() // Get the clicked contact's name
        fetchMessages(selectedRecipient)
    }
})

function fetchMessages(contactUsername) {
    fetch(`/messages/${contactUsername}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            return response.json()
        })
        .then((data) => {
            // Handle the data received from the server
            conversationContainer.innerHTML = ''
            data.forEach(message => {
                displayMessage(message.sender, message.message, message.timestamp)
                console.log(message)
            })
        })
        .catch((error) => {
            console.error('Error:', error)
        })

}

// Send the message to the server
document.addEventListener('DOMContentLoaded', function () {
    fetchMessages(selectedRecipient)
    const messageBox = document.getElementById('message-box')
    const messageForm = document.getElementById('message-form')

    // Add event listener to the form (for the button)
    messageForm.addEventListener('submit', async (e) => {
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
        if (message.trim() === '' || selectedRecipient === '') {
            return // Don't send empty messages
        }

        // Send message to socket for real time communication
        sendMessageToSocket(username, selectedRecipient, message)

        // Send message to server post to store in database
        fetch('/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ recipient: selectedRecipient, message: message }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok')
                }

                // console.log('Sent to db')
            })
            .catch((error) => {
                console.error('Error sending message:', error)
            })

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
    displayMessage(sender, message)
})