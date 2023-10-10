// This file is for manipulating the database as an administrator
// Currently can create and remove users
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const db = new sqlite3.Database('sqlite/user_data.db')
async function main(name, plaintextPassword) {

    try {
        const hashedPassword = await hashPassword(plaintextPassword)
        console.log('Bcrypt Hash:', hashedPassword)

        // User data (replace with actual values)
        const userData = {
            username: name,
            // Replace 'hashed_password_here' with the actual hashed password.
            password: hashedPassword,
        }

        // SQL statement to insert a new user with hashed password
        const sql = 'INSERT INTO users (username, password) VALUES (?, ?)'

        // Add user
        await runQuery(db, sql, [userData.username, userData.password])
        console.log(`User ${userData.username} added successfully.`)

        // Show users
        const users = await getAllUsers(db)
        console.log(users)
    } catch (err) {
        // Handle the error.
        console.error(err)
    } finally {
        // Close the database connection when done.
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err)
            } else {
                console.log('Database connection closed.')
            }
        })
    }
}

function hashPassword(password) {
    const saltRounds = 10
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                reject(err)
            } else {
                resolve(hash)
            }
        })
    })
}

function runQuery(db, sql, params) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err)
            } else {
                resolve(this)
            }
        })
    })
}

function getAllUsers(db) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM users', (err, rows) => {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}

// Delete user
function deleteUser(usernameToDelete) {
    const sql = 'DELETE FROM users WHERE username = ?'
    db.run(sql, [usernameToDelete], function (err) {
        if (err) {
            console.error('Error deleting user:', err)
        } else {
            console.log(`User ${usernameToDelete} deleted successfully.`)
        }
    })

}
// Show
db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
        console.error(err.message)
    } else {
        console.log(rows)
    }
})

// deleteUser('abc')
// main('Pier', 'margherita') // Create user

/*
Users: 
Casper 123
Wille abc
Pier margherita
*/

// Create user/password table
// db.run(`
// CREATE TABLE users (
//     id INTEGER PRIMARY KEY,
//     username TEXT NOT NULL,
//     password TEXT NOT NULL
// )
// `)

// Create the contact list table
// db.run(`
// CREATE TABLE contact_list (
//     id INTEGER PRIMARY KEY,
//     user_id INTEGER,
//     contact_username TEXT,
//     FOREIGN KEY (user_id) REFERENCES users(id)
// )
// `)

// Create the conversations table
// db.run(`
//     CREATE TABLE conversations (
//         id INTEGER PRIMARY KEY,
//         user_id INTEGER,
//         contact_id INTEGER,
//         timestamp DATETIME,
//         senders_message TEXT,
//         recipients_message TEXT,
//         FOREIGN KEY (user_id) REFERENCES users(id),
//         FOREIGN KEY (contact_id) REFERENCES users(id)
//     )
// `)

// Create RSA key table
// db.run(`
//     CREATE TABLE rsa_keys (
//         id INTEGER PRIMARY KEY,
//         user_id INTEGER,
//         public_key TEXT,
//         private_key TEXT,
//         FOREIGN KEY (user_id) REFERENCES users(id)
// )
// `)

// Add users to list
// const userId = 3
// const contactUsername = 'Casper'
// db.run(`
//     INSERT INTO contact_list (user_id, contact_username)
//     VALUES (?, ?)
// `, [userId, contactUsername])


async function generateKeys(userId) {
    // Generate an RSA key pair
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048, // The length of the key in bits
        publicKeyEncoding: {
            type: 'spki', // SubjectPublicKeyInfo (SPKI) format
            format: 'pem', // PEM encoding
        },
        privateKeyEncoding: {
            type: 'pkcs8', // Private Key Cryptography Standards (PKCS) #8 format
            format: 'pem', // PEM encoding
        },
    })

    // Insert the keys into the database
    const insertQuery = 'INSERT INTO rsa_keys (user_id, private_key, public_key) VALUES (?, ?, ?)'
    db.run(insertQuery, [userId, privateKey, publicKey], (err) => {
        if (err) {
            console.error('Error inserting RSA keys:', err)
        } else {
            console.log('RSA keys inserted successfully.')
        }
    })

    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err)
        } else {
            console.log('Database connection closed.')
        }
    })
}

// generateKeys(3)