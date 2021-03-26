require('dotenv').config({ path: __dirname + '/../.env' });

const express = require('express');

// Create express instance
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Require API routes
const users = require('./routes/users');
const test = require('./routes/test');
const login = require('./routes/login');

// Import API Routes
app.use(users);
app.use(test);
app.use(login);

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
