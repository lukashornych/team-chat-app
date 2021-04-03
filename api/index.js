require('dotenv').config({ path: __dirname + '/../.env' });

const express = require('express');
const mysql = require('mysql');

// Database connection pool
const pool = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.DB_HOST,
  port            : process.env.DB_PORT,
  user            : process.env.DB_USER,
  password        : process.env.DB_PASSWORD,
  database        : process.env.DB_DATABASE
});
module.exports.connectionDB = pool;

// Create express instance
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Require API routes
const users = require('./routes/users');
const test = require('./routes/test');
const accounts = require('./routes/accounts');
const channels = require('./routes/channels');

// Import API Routes
app.use(users);
app.use(test);
app.use(accounts);
app.use(channels);

// Export express app
module.exports = app;

// Start standalone server if directly running
if (require.main === module) {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API server listening on port ${port}`);
  });
}
