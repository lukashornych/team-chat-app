const authenticateToken = require('../../authenticateToken');
const pool = require('../../index').connectionDB;

/**
 ** GET ALL ACCOUNTS
 ** authenticated by token
 **/
const getAllAccounts = (req, res) => {
  authenticateToken(req, res, (authenticated) => {
    if (!authenticated) return res.sendStatus(401);

    pool.query(`SELECT * FROM allAccounts;`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + queryError.code + "\x1b[0m\n" + queryError.sqlMessage);
        return res.sendStatus(500);
      }

      res.status(200).json(queryResults);
    });
  });
}

module.exports = getAllAccounts;
