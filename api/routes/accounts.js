const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../index').connectionDB;

const router = Router();


/**
 ** REGISTER
 **/
router.post('/register', (req, res) => {
  if (!req.body.code || !req.body.name || !req.body.username || !req.body.password) return res.sendStatus(400);

  const code = req.body.code;
  const name = req.body.name;
  const username = req.body.username;
  const password = req.body.password;

  bcrypt.hash(password, 10, (hashError, hash) => {
    if(hashError) {
      console.log(hashError);
      return res.sendStatus(500);
    }

    pool.query(`CALL registerAccount('${code}', '${username}', '${name}', '${hash}');`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error(queryError);
        return res.sendStatus(500);
      }

      if (queryResults[0][0].output === "done") {
        res.sendStatus(200);

      } else if (queryResults[0][0].output === "unknown-code") {
        res.status(400).send("unknown-code");

      } else if (queryResults[0][0].output === "user-exists") {
        res.status(400).send("user-exists");

      } else {
        res.sendStatus(500);
      }
    });
  });
});


/**
 ** LOGIN
 **/
router.post('/login', (req, res) => {
  if (!req.body.username || !req.body.password) return res.sendStatus(400);

  const username = req.body.username;
  const password = req.body.password;

  pool.query(`SELECT * FROM account WHERE username='${username}';`, function (queryError, queryResults, queryFields) {
    if (queryError) {
      console.error(queryError);
      return res.sendStatus(500);
    }

    if(queryResults[0]) {
      bcrypt.compare(password, queryResults[0].passwordHash, (compareError, compareResult) => {
        if (compareError) {
          console.error(compareError);
          return res.sendStatus(500);
        }

        if (compareResult) {
          const body = {
            id: queryResults[0].id,
            username: queryResults[0].username,
            name: queryResults[0].name,
            role: queryResults[0].role
          }

          const token = jwt.sign(body, process.env.TOKEN_PRIVATE ); //, {expiresIn: "1h"}
          res.status(200).send({token: token});

        } else {
          res.sendStatus(400); // ??????????
        }
      });

    } else {
      res.sendStatus(400);
    }
  });
});


/**
 ** UPDATE ACCOUNT
 **/
router.put('/updateAccount', (req, res) => {
  if (!req.body.userId || !req.body.name || !req.body.username || !req.body.newPassword) return res.sendStatus(400);

  const userId = req.body.userId;
  const name = req.body.name;
  const username = req.body.username;
  const newPassword = req.body.newPassword;

  bcrypt.hash(newPassword, 10, (hashError, hash) => {
    if(hashError) {
      console.log(hashError);
      return res.sendStatus(500);
    }

    pool.query(`UPDATE account SET name='${name}', username='${username}', passwordHash='${hash}' WHERE id='${userId}';`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error(queryError);
        res.sendStatus(500);
      }

      res.sendStatus(200);
    });
  });
});


/**
 ** UPDATE ACCOUNT ROLE
 **/
router.put('/updateAccountRole', (req, res) => {
  if (!req.body.userId || !req.body.role) return res.sendStatus(400);

  const userId = req.body.userId;
  const role = req.body.role;

  pool.query(`UPDATE account SET role='${role}' WHERE id='${userId}';`, function (queryError, queryResults, queryFields) {
    if (queryError) {
      console.error(queryError);
      res.sendStatus(500);
    }

    res.sendStatus(200);
  });
});

/**
 ** GET ALL USERS
 **/
router.get('/getAllAccounts', (req, res) => {
  pool.query(`SELECT id, name, username, role FROM account;`, function (queryError, queryResults, queryFields) {
    if (queryError) {
      console.error(queryError);
      res.sendStatus(500);
    }

    res.status(200).json(queryResults);
  });
});


module.exports = router;


function authenticateToken(req, res, callback) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if(token === null) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_PRIVATE, (verifyError, user) => {
    if (verifyError) {
      console.error(verifyError);
      return res.sendStatus(403);
    }

    req.user = user;
    callback();
  });
}


/**
 ** DEBUG SECTION
 **/


// DEBUG Verify Token
router.get('/verifytoken/:token', (req, res) => {
  jwt.verify(req.params.token, process.env.TOKEN_PRIVATE, (verifyError, user) => { // DEBUG
    if (verifyError) {
      console.error("invalid signature");
      return res.sendStatus(401);
    }
    console.log(user);
    res.sendStatus(200);
  });
});


// DEBUG Test DB Connection
router.get('/detest', (req, res) => {
  pool.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);
    res.sendStatus(200);
  });
});


// POST login



// POST createAdmin - DEBUG!
router.post('/createAdmin', (req, res) => {
  if (!req.body.username || !req.body.password) return res.sendStatus(400);

  bcrypt.hash(req.body.password, 10, (hashError, hash) => {
    if(hashError) {
      console.log(hashError);
      return res.sendStatus(500);
    }

    pool.query(`INSERT INTO account (username, name, passwordHash, role) values ('${req.body.username}', 'ADMIN', '${hash}', 'ADMIN');`, function (queryError, results, fields) {
      if (queryError) {
        console.error(queryError);
        return res.sendStatus(500);
      }
      res.sendStatus(201);
    });
  });
});
