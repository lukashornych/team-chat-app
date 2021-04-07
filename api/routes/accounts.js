const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const api = require('../index');
const pool = api.connectionDB;

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

          const token = jwt.sign(body, process.env.TOKEN_PRIVATE, {expiresIn: "24h"} ); //, {expiresIn: "1h"}

          const cutToken = token.split(".");

          res.cookie("jwt-hs", cutToken[0]+"."+cutToken[2], { maxAge: 900000, httpOnly: true });
          res.cookie("jwt-payload", cutToken[1], { maxAge: 900000, httpOnly: false });

          res.sendStatus(200);

        } else {
          res.sendStatus(403); // ??????????
        }
      });

    } else {
      res.sendStatus(400);
    }
  });
});


/**
 ** UPDATE ACCOUNT
 ** authenticated by token
 **/ //TODO udělat parametry nepovinné, např newPassword/username/name nepovinné
router.put('/updateAccount', (req, res) => {
  authenticateToken(req, res, (authenticated) => {
    if (!authenticated) return res.sendStatus(403);

    if (!req.body.userId || (!req.body.name && !req.body.username && !req.body.newPassword)) return res.sendStatus(400);

    const userId = req.body.userId;

    let setter = [];     // SET statement creation
    if (req.body.role) setter.push(`role='${req.body.role}'`);
    if (req.body.name) setter.push(`name='${req.body.name}'`);
    if (req.body.username) setter.push(`username='${req.body.username}'`);
    if (req.body.newPassword) {
      const newPasswordHash = bcrypt.hashSync(req.body.newPassword, 10);
      setter.push(`passwordHash='${newPasswordHash}'`);
    }

    pool.query(`UPDATE account SET ${setter.toString()} WHERE id='${userId}';`, function (queryError, queryResults, queryFields) {
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
 ** authenticated by token
 **/
router.put('/updateAccountRole', (req, res) => {
  authenticateToken(req, res, (authenticated) => {
    if (!authenticated) return res.sendStatus(403);

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
});

/**
 ** GET ALL USERS
 ** authenticated by token
 **/
router.get('/getAllAccounts', (req, res) => {
  authenticateToken(req, res, (authenticated) => {
    if (!authenticated) return res.sendStatus(403);

    pool.query(`SELECT id, name, username, role FROM account;`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error(queryError);
        res.sendStatus(500);
      }

      res.status(200).json(queryResults);
    });
  });
});


module.exports = router;


/**
 ** Token authentication function
 ** @param req
 ** @param res
 ** @param callback
 **/
const authenticateToken = function (req, res, callback) {
  if(!req.cookies["jwt-hs"] || !req.cookies["jwt-payload"]) return callback(false);

  const hs = req.cookies["jwt-hs"].split(".");

  let token;
  if (hs.length === 2) {
    token = hs[0] + "." + req.cookies["jwt-payload"] + "." + hs[1];
  }


  if(token == null) {
    res.clearCookie("jwt-hs");
    res.clearCookie("jwt-payload");
    return callback(false);
  }

  jwt.verify(token, process.env.TOKEN_PRIVATE, (verifyError, user) => {
    if (verifyError) {
      console.error(verifyError);
      //return res.sendStatus(403);
      res.clearCookie("jwt-hs");
      res.clearCookie("jwt-payload");
      return callback(false);
    }

    req.user = user;
    callback(true);
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
  authenticateToken(req, res, (authenticated) => {
    if(authenticated) {
      pool.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
        if (error) throw error;
        console.log('The solution is: ', results[0].solution);
        res.sendStatus(200);
      });
    } else {
      res.sendStatus(403);
    }
  });
});


// POST login



// POST createAdmin - DEBUG!
router.post('/createAdmin', (req, res) => {
  if (!req.body.username || !req.body.password) return res.sendStatus(400);

  bcrypt.hash(req.body.password, 10, (hashError, hash) => {
    if(hashError) {
      console.error(hashError);
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




