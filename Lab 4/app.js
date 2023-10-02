// https://www.section.io/engineering-education/rendering-html-pages-as-a-http-server-response-using-node-js/
const express = require("express")
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }))

app.listen(3000, () => {
    console.log("Application started and Listening on port http://127.0.0.1:3000/")
})

// serve your css as static
app.use(express.static(__dirname))

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

app.post('/login', (req, res) => {
    const { username, password } = req.body

    // Check if the username and password are correct (perform validation)
    if (username === 'your_username' && password === 'your_password') {
        // Authentication successful
        // Set a session or JWT token to remember the user's login state
        req.session.user = { username } // Example using Express-session for session management
        res.redirect('/dashboard') // Redirect to a dashboard or protected page
    } else {
        // Authentication failed
        res.render('login', { error: 'Invalid credentials' }) // Render the login page with an error message
    }
})