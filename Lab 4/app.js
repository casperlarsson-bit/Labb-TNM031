const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const bcrypt = require('bcrypt')
const sqlite3 = require('sqlite3')

const http = require('http')
const https = require('https')
const fs = require('fs')
const socketIO = require('socket.io')

const app = express()

// Load SSL certificate and private key
const privateKey = fs.readFileSync('https/private_key.pem', 'utf8');
const certificate = fs.readFileSync('https/certificate.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

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

// Function to hash a password and return the hash
function hashPassword(password) {
    const saltRounds = 10
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                reject(err)
            }
            else {
                resolve(hash)
            }
        })
    })
}

// Configure express-session
app.use(
    session({
        secret: 'your_secret_key', // Replace with a secure secret key
        resave: true,
        saveUninitialized: true,
    })
)

const db = new sqlite3.Database('sqlite/mydatabase.db')

// Start server on desired port
server.listen(3000, () => {
    console.log('Application started and Listening on port http://127.0.0.1:3000/\n')
})

// Save static css
//app.use(express.static(__dirname + '/public'))
app.use('/public', express.static(__dirname + '/public'))

// Request index.ejs as startup file
app.get('/', (req, res) => {
    // res.sendFile(__dirname + '/index.ejs')
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

// Login logics
app.post('/login', async (req, res) => {
    const { username, password } = req.body
    const hashedPasswod = await hashPassword(password)

    checkUsernameExistence(username, (err, usernameExists) => {
        if (err) {
            // Handle the error.
            console.error('Error checking username existence:', err)
            return
        }

        if (!usernameExists) {
            // Username does not exist.
            console.log('Username not found.')
            // You can send an error message to the user here.
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
                console.log('Username and password are valid.')
                // Proceed with allowing the user to log in.
                req.session.user = { username }
                res.redirect('views/dashboard')
            } else {
                // Password is incorrect.
                console.log('Incorrect password.')
                res.redirect('/views/signin?error=403')
            }
        })
    })
})

// Define a route for serving files from the views folder
app.get('/views/:filename', isAuthenticated, (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')

    // Get the requested filename from the route parameters
    const filename = req.params.filename
    const error = req.query.error

    if (filename === 'dashboard') {
        const { username } = req.session.user // Retrieve the username from the session
        res.render(__dirname + '/views/' + filename + '.ejs', { username: username })
    }
    else {
        res.render(__dirname + '/views/' + filename + '.ejs', { error: error })
    }

    // User is authenticated, so serve the requested file from the views folder
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
        console.log(sender + ' sends ' + message + ' to ' + recipient)

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