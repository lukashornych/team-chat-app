const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../index').connectionDB;
const promisePool = pool.promise();
const authenticateToken = require('../authenticateToken');
const base64 = require('base64-js');

const router = Router();

let photo = null;



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
        console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + queryError.code + "\x1b[0m\n" + queryError.sqlMessage);
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
      console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + queryError.code + "\x1b[0m\n" + queryError.sqlMessage);
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

          res.cookie("jwt-hs", cutToken[0]+"."+cutToken[2], { maxAge: 86400000, httpOnly: true, sameSite: "lax" });  // 1 den
          res.cookie("jwt-payload", cutToken[1], { maxAge: 86400000, httpOnly: false, sameSite: "lax" }); //sameSite: "lax", secure: false

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
 ** LOGOUT
 **/
router.post('/logout', (req, res) => {
  authenticateToken(req, res, (authenticated) => {
    if (!authenticated) return res.sendStatus(401);

    res.clearCookie("jwt-hs");
    res.clearCookie("jwt-payload");

    res.sendStatus(200);
  });
});


/**
 ** UPDATE ACCOUNT
 ** authenticated by token
 **
 ** Only ADMIN can update roles and other accounts.
 **/
router.put('/updateAccount', (req, res) => {
  authenticateToken(req, res, async (authenticated) => {
    if (!authenticated) return res.sendStatus(401);

    if (!req.body.name && !req.body.username && !req.body.newPassword && !req.body.role && !req.body.newPhoto) return res.sendStatus(400);

    // Je ADMIN -> může editovat role
    //          -> může editovat cizí účty
    if (req.user.role !== "ADMIN" && req.body.userId) return res.sendStatus(403);
    if (req.user.role !== "ADMIN" && req.body.role) return res.sendStatus(403);

    let isTokenUser = false;
    let userId = req.body.userId;
    if (!userId) {
      userId = req.user.id;
      isTokenUser = true;
    }

    let tokenUser = req.user;
    delete tokenUser.iat;
    delete tokenUser.exp;

    let setter = [];     // SET statement creation

    if (req.body.role) {
      setter.push(`role='${req.body.role}'`);
      if (isTokenUser) tokenUser.role = req.body.role;
    }
    if (req.body.name) {
      setter.push(`name='${req.body.name}'`);
      if (isTokenUser) tokenUser.name = req.body.name;
    }
    if (req.body.username) {
      // If username exists return 409 - Conflict
      const usernameExists = await promisePool.query(`SELECT COUNT(*) AS count FROM account WHERE username='${req.body.username}';`);
      if (usernameExists[0][0].count !== 0) return res.sendStatus(409);

      setter.push(`username='${req.body.username}'`);
      if (isTokenUser) tokenUser.username = req.body.username;
    }
    if (req.body.newPassword) {
      const newPasswordHash = bcrypt.hashSync(req.body.newPassword, 10);
      setter.push(`passwordHash='${newPasswordHash}'`);
    }

    // DB TRANSACTION
    pool.getConnection(function (connectionError, connection) {  // DB connection from pool
      if (connectionError) {
        console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + connectionError.code + "\x1b[0m\n" + connectionError.sqlMessage);
        return res.sendStatus(500);
      }

      connection.beginTransaction(function (transactionError) { // BEGIN TRANSACTION
        if (transactionError) {
          console.error("\n\x1b[31mQuery transaction error! \x1b[0m\x1b[32m" + transactionError.code + "\x1b[0m\n" + transactionError.sqlMessage);
          return res.sendStatus(500);
        }

        // Pokud existuje name || username || newPassword || role
        if (req.body.name || req.body.username || req.body.newPassword || req.body.role) {
          connection.query(`UPDATE account SET ${setter.toString()} WHERE id='${userId}';`, function (queryError, queryResults, queryFields) {
            if (queryError) {
              console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + queryError.code + "\x1b[0m\n" + queryError.sqlMessage);
              return res.sendStatus(500);
            }

            if(isTokenUser) {
              const token = jwt.sign(tokenUser, process.env.TOKEN_PRIVATE, {expiresIn: "24h"} ); //, {expiresIn: "1h"}

              const cutToken = token.split(".");

              res.cookie("jwt-hs", cutToken[0]+"."+cutToken[2], { maxAge: 86400000, httpOnly: true, sameSite: "lax" });  // 1 den
              res.cookie("jwt-payload", cutToken[1], { maxAge: 86400000, httpOnly: false, sameSite: "lax" }); //sameSite: "lax", secure: false
            }
          });
        }

        // Pokud existuje newPhoto
        if (req.body.newPhoto) {
          connection.query(`CALL addAccountPhoto (${userId}, '${req.body.newPhoto}');`, function (queryError, queryResults, queryFields) {
            if (queryError) {
              console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + queryError.code + "\x1b[0m\n" + queryError.sqlMessage);
              return res.sendStatus(500);
            }
          });
        }

        connection.commit(function (commitError) {  // COMMIT TRANSACTION
          if (commitError) {
            return connection.rollback(function () {
              console.error("\n\x1b[31mQuery commit error! \x1b[0m\x1b[32m" + commitError.code + "\x1b[0m\n" + commitError.sqlMessage);
              return res.sendStatus(500);
            });
          }

          res.sendStatus(200);
        });
      });
    });
  });
});


/**
 ** GET ALL USERS
 ** authenticated by token
 **/
router.get('/getAllAccounts', (req, res) => {
  authenticateToken(req, res, (authenticated) => {
    if (!authenticated) return res.sendStatus(401);

    pool.query(`SELECT id, name, username, role FROM account;`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + queryError.code + "\x1b[0m\n" + queryError.sqlMessage);
        return res.sendStatus(500);
      }

      res.status(200).json(queryResults);
    });
  });
});



/**
 ** GET ACCOUNT PHOTO
 ** authenticated by token
 **/
router.get('/getAccountPhoto/:id', (req, res) => {
  authenticateToken(req, res, (authenticated) => {
    if (!authenticated) return res.sendStatus(401);

    const id = req.params.id;

    pool.query(`SELECT data FROM photo p JOIN accountInPhoto aip ON p.id=aip.photoId WHERE aip.accountId=${id};`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + queryError.code + "\x1b[0m\n" + queryError.sqlMessage);
        return res.sendStatus(500);
      }

      if (queryResults[0]) {
        const img = Buffer.from(queryResults[0].data.toString(), "base64");

        res.writeHead(200, {
          'Content-Type': 'image/jpg',
          'Content-Length': img.length
        });

        res.end(img);

      } else {
        const img = Buffer.from(process.env.DEFAULT_BASE64_PHOTO, 'base64');

        res.writeHead(200, {
          'Content-Type': 'image/jpg',
          'Content-Length': img.length
        });

        res.end(img);
      }

    });
  });
});


module.exports = router;

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
        console.error("Someone tried to create 'admin' account!");
        return res.sendStatus(500);
      }
      res.sendStatus(201);
    });
  });
});




