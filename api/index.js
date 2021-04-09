require('dotenv').config({ path: __dirname + '/../.env' });

const http = require('http');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
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


// Create express and http instance
const app = express();
const server = http.createServer(app);

// Export http server
//module.exports = server;

// Express use parsers
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Require API routes
const accounts = require('./routes/accounts');
const channels = require('./routes/channels');
const registrationInvitations = require('./routes/registrationInvitations');
const messages = require('./routes/messages');

// Use API Routes
app.use(accounts);
app.use(channels);
app.use(registrationInvitations);
app.use(messages);

// Export express app
module.exports = app;

// require('./messages'); // todo tomdo: smazat???

// Start standalone server if directly running
if (require.main === module) {
  const port = process.env.PORT || 3001;
  server.listen(port, () => {
    console.log(`API server listening on port ${port}`);
  });
}


