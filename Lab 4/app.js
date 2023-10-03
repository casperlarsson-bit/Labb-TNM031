const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')
const bcrypt = require('bcrypt')

app.use(bodyParser.urlencoded({ extended: true }))
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')
app.set("views", __dirname)

// Rest if the user is authenticated, otherwise return to login page
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next()
    }
    res.redirect('/')
}

// Function to hash a password and return the hash
function hashPassword(password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hash) => {
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
        resave: false,
        saveUninitialized: true,
    })
)

// Start server on desired port
app.listen(3000, () => {
    console.log('Application started and Listening on port http://127.0.0.1:3000/\n')
})

// Save static css
//app.use(express.static(__dirname + '/public'))
app.use('/styles', express.static(__dirname + '/public'))

// Request index.html as startup file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

// Login logics
app.post('/login', (req, res) => {
    const { username, password } = req.body

    /*hashPassword(password)
        .then((hash) => {
            console.log('Bcrypt Hash:', hash)
        })
        .catch((err) => {
            console.error('Error hashing password:', err)
        })*/

    if (username === 'abc' && password === '123') {
        req.session.user = { username }
        res.redirect('views/dashboard')
    } else {
        res.status(401).send('Invalid credentials')
    }
})

// Define a route for serving files from the views folder
app.get('/views/:filename', isAuthenticated, (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    
    // Get the requested filename from the route parameters
    const filename = req.params.filename
    const { username } = req.session.user // Retrieve the username from the session

    // User is authenticated, so serve the requested file from the views folder
    res.render(__dirname + '/views/' + filename + '.html', { username: username })
})

// Log out
app.get('/logout', (req, res) => {
    // Destroy the user's session to log them out
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err)
        }
        // Redirect the user to the login page or any other desired location
        res.redirect('/') // You can replace '/login' with your login route
    })
})