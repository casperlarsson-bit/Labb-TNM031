const sqlite3 = require('sqlite3')

const db = new sqlite3.Database('sqlite/mydatabase.db')

db.run(`
  INSERT INTO users (username, password)
  VALUES (?, ?)
`, ['abc', '123'])

db.close((err) => {
    if (err) {
        console.error('Error closing database:', err)
    } else {
        console.log('Database connection closed.')
    }
})