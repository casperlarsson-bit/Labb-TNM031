const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')

const db = new sqlite3.Database('sqlite/mydatabase.db')
async function main() {

    try {
        const plaintextPassword = '123' // Replace with the user's password.
        const hashedPassword = await hashPassword(plaintextPassword)
        console.log('Bcrypt Hash:', hashedPassword)

        // User data (replace with actual values)
        const userData = {
            username: 'abc',
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
// Show users
// db.all('SELECT * FROM users', (err, rows) => {
//     if (err) {
//         console.error(err.message)
//     } else {
//         console.log(rows)
//     }
// })

// deleteUser('abc')
main() // Create user
