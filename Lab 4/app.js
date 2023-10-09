const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const bcrypt = require('bcrypt')
const sqlite3 = require('sqlite3')
const crypto = require('crypto')

const http = require('http')
const https = require('https')
const fs = require('fs')
const socketIO = require('socket.io')

const app = express()

// Load SSL certificate and private key
const privateKey = fs.readFileSync('https/private_key.pem', 'utf8')
const certificate = fs.readFileSync('https/certificate.pem', 'utf8')
const credentials = { key: privateKey, cert: certificate }

const server = http.createServer(app)
//const server = https.createServer(credentials, app)
const io = socketIO(server)

app.use(bodyParser.json()) // Might interfere with below
app.use(bodyParser.urlencoded({ extended: true }))
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'ejs')
app.set("views", __dirname)

// Rest if the user is authenticated, otherwise return to login page
function isAuthenticated(req, res, next) {
    if (req.path === '/views/signin') {
        return next()
    }

    if (req.session.user) {
        return next()
    }
    res.redirect('/sign-in')
}

// Configure express-session
app.use(
    session({
        secret: 'your_secret_key', // Replace with a secure secret key
        resave: true,
        saveUninitialized: true,
    })
)

const db = new sqlite3.Database('sqlite/user_data.db')

// Start server on desired port
server.listen(3000, () => {
    console.log('Application started and Listening on port http://127.0.0.1:3000/\n')
})

// Save statics, like css, client js, images
app.use('/public', express.static(__dirname + '/public'))

// Request index.ejs as startup file
app.get('/', (req, res) => {
    res.render('index')
})

// Function to check if the username exists in the database
function checkUsernameExistence(usernameToCheck, callback) {
    // SQL query to check if the username exists in the database
    const usernameExistenceQuery = 'SELECT 1 FROM users WHERE username = ?'

    // Execute the query with the username as a parameter
    db.get(usernameExistenceQuery, [usernameToCheck], (err, row) => {
        if (err) {
            console.error(err)
            return callback(err)
        }

        const usernameExists = !!row
        callback(null, usernameExists)
    })
}

// Function to verify the password for an existing username
function verifyPassword(usernameToCheck, passwordToCheck, callback) {
    const passwordRetrievalQuery = 'SELECT password FROM users WHERE username = ?'

    db.get(passwordRetrievalQuery, [usernameToCheck], (err, row) => {
        if (err) {
            console.error(err)
            return callback(err)
        }

        if (!row) {
            // Username does not exist
            return callback(null, false)
        }

        const hashedPasswordFromDatabase = row.password

        // Compare the hashed password from the database with the provided password
        bcrypt.compare(passwordToCheck, hashedPasswordFromDatabase, (err, result) => {
            if (err) {
                console.error(err)
                return callback(err)
            }

            if (result) {
                // Passwords match, user can log in
                callback(null, true)
            }
            else {
                // Passwords do not match
                callback(null, false)
            }
        })
    })
}

// Query users contact list
const getContactsMiddleware = (req, res, next) => {
    const userId = req.session.userId?.id || null

    const query = `
      SELECT contact_username
      FROM contact_list
      WHERE user_id = ?
    `

    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.error('Error fetching contacts:', err)
            // Handle the error or send an empty array if there's an error
            res.locals.contacts = []
        } else {
            const contacts = rows.map((row) => row.contact_username)
            res.locals.contacts = contacts
        }
        next() // Continue to the next middleware or route handler
    })
}

// Function to retrieve the user_id by username as a Promise
function getUserIdByUsername(username) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id FROM users WHERE username = ?'
        db.get(query, [username], (err, row) => {
            if (err) {
                reject(err)
            } else {
                if (row) {
                    resolve(row.id)
                } else {
                    resolve(null) // User not found
                }
            }
        })
    })
}

// Function to retrieve the public key by user ID
function getPublicKeyByUserId(userId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT public_key FROM rsa_keys WHERE user_id = ?'
        db.get(query, [userId], (err, row) => {
            if (err) {
                reject(err)
            } else {
                if (row) {
                    resolve(row.public_key)
                } else {
                    resolve(null)
                }
            }
        })
    })
}

// Function to retrieve the private key by user ID
function getPrivateKeyByUserId(userId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT private_key FROM rsa_keys WHERE user_id = ?'
        db.get(query, [userId], (err, row) => {
            if (err) {
                reject(err)
            } else {
                if (row) {
                    resolve(row.private_key)
                } else {
                    resolve(null)
                }
            }
        })
    })
}

// Function to encrypt a message using the recipient's public key
function encryptMessage(message, recipientPublicKey) {
    // Use your encryption library to encrypt the message
    const encryptedMessage = crypto.publicEncrypt(
        recipientPublicKey,
        Buffer.from(message, 'utf8')
    )
    return encryptedMessage.toString('base64') // Convert to base64 for storage
}

// Login logics
app.post('/login', async (req, res) => {
    const { username, password } = req.body

    checkUsernameExistence(username, (err, usernameExists) => {
        if (err) {
            // Handle the error.
            console.error('Error checking username existence:', err)
            return
        }

        if (!usernameExists) {
            // Username does not exist.
            // Send an error message to the user here.
            res.redirect('/views/signin?error=204')
            return
        }

        // Username exists now verify the password.
        verifyPassword(username, password, (err, passwordIsValid) => {
            if (err) {
                // Handle the error.
                console.error('Error verifying password:', err)
                res.redirect('/views/signin?error=500')
                return
            }

            if (passwordIsValid) {
                // Password is valid user can log in.
                // Fetch the user's ID from the database based on their username
                const userIdQuery = 'SELECT id FROM users WHERE username = ?'


                db.get(userIdQuery, [username], (err, row) => {
                    if (err) {
                        console.error('Error fetching user ID:', err)
                        res.redirect('/views/signin?error=500')
                        return
                    }

                    if (!row) {
                        // User not found (this should not happen)
                        console.error('User not found in database.')
                        res.redirect('/views/signin?error=500')
                        return
                    }

                    const userId = row.id

                    // Proceed with allowing the user to log in.
                    req.session.user = { username }
                    req.session.userId = { id: userId } // Store the user's ID
                    res.redirect('views/dashboard')
                })
            } 
            else {
                // Password is incorrect.
                res.redirect('/views/signin?error=403')
            }
        })
    })
})

// Define a route for serving files from the views folder
app.get('/views/:filename', isAuthenticated, getContactsMiddleware, (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')

    // Get the requested filename from the route parameters
    const filename = req.params.filename
    const error = req.query.error

    if (filename === 'dashboard') {
        const { username } = req.session.user // Retrieve the username from the session
        const contacts = res.locals.contacts
        res.render(__dirname + '/views/' + filename + '.ejs', { username: username, contacts: contacts })
    }
    else {
        res.render(__dirname + '/views/' + filename + '.ejs', { error: error })
    }
})

// Sign in
app.get('/sign-in', (req, res) => {
    res.redirect('views/signin')
})

// Log out
app.get('/logout', (req, res) => {
    // Destroy the user's session to log them out
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err)
        }
        // Redirect the user to the login page or any other desired location
        res.redirect('/views/signin') // You can replace '/login' with your login route
    })
})

// Create listener for messages from users
io.on('connection', (socket) => {
    const username = socket.handshake.query.username // Assuming you pass the username as a query parameter during connection
    socket.join(username) // Join a room with the user's username
    console.log(`User ${username} connected`)

    socket.on('message', (data) => {
        const { sender, recipient, message } = data

        // Send message back to sender
        socket.emit('message', {
            sender: sender,
            message: message
        })

        // Send message to recipient
        io.to(recipient).emit('message', {
            sender: sender,
            message: message
        })
    })

    socket.on('disconnect', () => {
        console.log('User disconnected')
    })
})

// Store the messages on the database
app.post('/messages', isAuthenticated, async (req, res) => {
    const { recipient, message } = req.body
    const userId = req.session.userId?.id || null

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' })
    }

    try {
        const recipientId = await getUserIdByUsername(recipient)

        const senderPublicKey = await getPublicKeyByUserId(userId)
        const recipientPublicKey = await getPublicKeyByUserId(recipientId)

        if (!senderPublicKey || !recipientPublicKey) {
            console.log('Sender or recipient public key not found.')
            return
        }

        const sendersEncryptedMessage = encryptMessage(message, senderPublicKey)
        const recipientsEncryptedMessage = encryptMessage(message, recipientPublicKey)

        const timestamp = new Date().toISOString()

        const insertQuery = `
            INSERT INTO conversations (user_id, contact_id, senders_message, recipients_message, timestamp)
            VALUES (?, ?, ?, ?, ?)
        `

        // Insert the message into the conversations table
        db.run(insertQuery, [userId, recipientId, sendersEncryptedMessage, recipientsEncryptedMessage, timestamp], (err) => {
            if (err) {
                console.error('Error inserting encrypted message:', err)
                return res.status(500).json({ error: 'Failed to send message' })
            }
        })

        res.status(200).json({ success: true })

    } catch (err) {
        console.error('Error sending message:', err)
    }
})

// Load messages from database for the current conversation
app.get('/messages/:contactUsername', isAuthenticated, async (req, res) => {
    const contactUsername = req.params.contactUsername
    const userId = req.session.userId?.id || null

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' })
    }

    function decryptMessage(encryptedMessage, privateKeyPEM) {
        // Convert the PEM-encoded private key to a Buffer
        const privateKeyBuffer = Buffer.from(privateKeyPEM)

        // Convert the base64-encoded message to a Buffer
        const encryptedBuffer = Buffer.from(encryptedMessage, 'base64')

        try {
            // Decrypt the message using the private key
            const decryptedBuffer = crypto.privateDecrypt(
                {
                    key: privateKeyBuffer,
                    padding: crypto.constants.RSA_PKCS8_PADDING,
                },
                encryptedBuffer
            )

            // Convert the decrypted Buffer to a string
            const decryptedMessage = decryptedBuffer.toString('utf8')
            return decryptedMessage
        } catch (error) {
            console.error('Error decrypting message:', error)
            return null // Handle decryption error as needed
        }
    }

    try {
        // const privateKey = privateKeyRow.private_key
        const privateKey = await getPrivateKeyByUserId(userId)

        // Query the messages for the specified conversation
        const getMessagesQuery = `
            SELECT c.user_id, u.username AS sender, c.senders_message, c.recipients_message, c.timestamp
            FROM conversations c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE (c.user_id = ? AND c.contact_id = (SELECT id FROM users WHERE username = ?))
                OR (c.user_id = (SELECT id FROM users WHERE username = ?) AND c.contact_id = ?)
            ORDER BY c.timestamp ASC
        `
        db.all(getMessagesQuery, [userId, contactUsername, contactUsername, userId], (err, rows) => {
            if (err) {
                console.error('Error fetching messages:', err)
                return res.status(500).json({ error: 'Failed to retrieve messages' })
            }

            // Decrypt the messages based on whether the user is the sender or recipient
            const decryptedMessages = rows.map((message) => {
                return ({
                    sender: message.sender,
                    message: userId === message.user_id
                        ? decryptMessage(message.senders_message, privateKey)
                        : decryptMessage(message.recipients_message, privateKey),
                    timestamp: message.timestamp
                })
            }
            )

            res.status(200).json(decryptedMessages)
        })

    } catch (err) {
        console.error('Error fetching and decrypting messages:', err)
        res.status(500).json({ error: 'Failed to retrieve messages' })
    }
})

// Close the database connection when the server is about to exit (optional).
process.on('exit', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err)
        } else {
            console.log('Database connection closed.')
        }
    })
})