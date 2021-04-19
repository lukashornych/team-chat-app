const authenticateToken = require('../../authenticateToken');
const pool = require('../../index').connectionDB;
const promisePool = pool.promise();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 ** UPDATE ACCOUNT
 ** authenticated by token
 **/
const updateAccount = (req, res) => {
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
    if (req.body.username && req.body.username !== req.user.username) {
      // If new username exists return 409 - Conflict
      const usernameExists = await promisePool.query(`SELECT COUNT(*) AS count FROM account WHERE username='${req.body.username}';`);
      if (usernameExists[0][0].count !== 0) return res.sendStatus(409);

      setter.push(`username='${req.body.username}'`);
      if (isTokenUser) tokenUser.username = req.body.username;
    }
    if (req.body.newPassword) {
      const newPasswordHash = bcrypt.hashSync(req.body.newPassword, 10);
      setter.push(`passwordHash='${newPasswordHash}'`);
    }

    if (setter.length === 0) return res.sendStatus(400);

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
}

module.exports = updateAccount;
