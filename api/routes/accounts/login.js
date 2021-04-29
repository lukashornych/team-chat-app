const pool = require('../../index').connectionDB;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 ** LOGIN
 **/
const login = (req, res) => {
  if (!req.body.username || !req.body.password) return res.sendStatus(400);

  const username = req.body.username;
  const password = req.body.password;

  pool.query(`SELECT * FROM account WHERE username='${username}';`, function (queryError, queryResults, queryFields) {
    if (queryError) {
      console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + queryError.code + "\x1b[0m\n" + queryError.sqlMessage);
      return res.sendStatus(500);
    }

    if(queryResults[0]) {
      // Ověření hesla
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

          // Vytvoření tokenu
          const token = jwt.sign(body, process.env.TOKEN_PRIVATE, {expiresIn: "24h"} ); //, {expiresIn: "1h"}

          const cutToken = token.split(".");

          res.cookie("jwt-hs", cutToken[0]+"."+cutToken[2], { maxAge: 86400000, httpOnly: true, sameSite: "lax" });  // 1 den
          res.cookie("jwt-payload", cutToken[1], { maxAge: 86400000, httpOnly: false, sameSite: "lax" }); //sameSite: "lax", secure: false

          res.sendStatus(200);

        } else {
          res.sendStatus(403);
        }
      });

    } else {  // Zadané uživatelské jméno neexistuje
      res.sendStatus(400);
    }
  });
}

module.exports = login;
