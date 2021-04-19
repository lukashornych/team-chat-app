const bcrypt = require('bcrypt');
const pool = require('../../index').connectionDB;

/**
 ** REGISTER
 **/
const register = (req, res) => {

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

}

module.exports = register;
