const textarea = document.getElementById('message-box')
const maxRows = 4 // Set the maximum number of rows

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

const firstRecipient = document.querySelector('.contact-person')
let selectedRecipient = firstRecipient ? firstRecipient.innerHTML.trim() : null // Global variable to store the recipient
let lastMessageTime = null

if (firstRecipient) {
    document.getElementsByClassName('contact-person')[0].classList.add('contact-person-active')
}
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
    const formattedTime = timestamp ? extractHoursAndMinutes(timestamp) : extractHoursAndMinutes(Date.now())
    timeMessageDiv.innerHTML = formattedTime
    messageDiv.appendChild(timeMessageDiv)

    // Append the new message <div> to the conversation container
    conversationContainer.appendChild(messageDiv)
    scrollToBottom()
}

function extractHoursAndMinutes(timestamp) {
    const dateObj = new Date(timestamp)

    const hours = dateObj.getUTCHours() + 2
    const minutes = dateObj.getUTCMinutes()

    // Pad single-digit minutes with a leading zero
    // if minutes < 10 set a 0 in fron else do nothing
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes

    return `${hours}:${paddedMinutes}`
}

function extractDate(timestamp) {
    const dateObj = new Date(timestamp)

    const year = dateObj.getFullYear()
    const month = dateObj.getMonth() // Januari is 0
    const date = dateObj.getDate()
    const diffDate = new Date().getDate() - date

    if (diffDate === 0) {
        return 'Today'
    }

    if (diffDate === 1) {
        return 'Yesterday'
    }

    return months[month] + '. ' + date
}

function displayDate(timestamp) {
    const dateDiv = document.createElement('div')
    dateDiv.className = 'message-date'
    dateDiv.classList.add('message')
    dateDiv.innerHTML = extractDate(timestamp)

    // Append the new message <div> to the conversation container
    conversationContainer.appendChild(dateDiv)
    scrollToBottom()
}

textarea.addEventListener('input', resizeTextarea)

document.getElementById('contact-list').addEventListener('click', (event) => {
    if (event.target && event.target.classList.contains('contact-person')) {
        selectedRecipient = event.target.textContent.trim() // Get the clicked contact's name


        // Reset all contact divs to not active css
        const contacts = Array.from(document.getElementsByClassName('contact-person'))
        contacts.map(contact => contact.classList.remove('contact-person-active'))

        // Set the ac
        event.target.classList.add('contact-person-active')

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
            let previousDate = ''
            data.forEach(message => {
                const currentDate = new Date(message.timestamp).toDateString()

                if (currentDate !== previousDate) {
                    displayDate(message.timestamp)
                }

                displayMessage(message.sender, message.message, message.timestamp)

                previousDate = currentDate
                lastMessageTime = new Date(message.timestamp)
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
        const message =  messageBox.value.replace(/</g, "&lt;").replace(/>/g, "&gt;")
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

    if (lastMessageTime && new Date().getDate() - lastMessageTime.getDate() > 0) {
        displayDate(new Date())
    }

    displayMessage(sender, message)

    if (sender !== username) {
        let audio
        if (Math.floor(Math.random() * 1000000) + 1 === 1) {
            audio = new Audio('../public/audio/skype.ogg')
        }
        else {
            audio = new Audio('../public/audio/received.ogg')
        }
        audio.play()
    }
})
