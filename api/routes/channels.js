const { Router } = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../index').connectionDB;

const router = Router();

/**
 ** NEW CHANNEL
 **/
router.post('/newChannel', (req, res) => {
  if (!req.body.type || !req.body.name || !req.body.description) return res.sendStatus(400);
  if (req.body.type !== ("PRIVATE_GROUP" || "PUBLIC_CHANNEL" )) return res.sendStatus(400);

  const type = req.body.type;
  const name = req.body.name;
  const description = req.body.description;
  const userIds = req.body.userIds;

  if (!userIds || userIds.length === 0) {   // Existuje seznam účtů
    pool.query(`INSERT INTO channel(name, description, type) VALUE ('${name}', '${description}', '${type}');`, function (queryError, queryResults, queryFields) {
        if (queryError) {
          console.error(queryError);
          res.sendStatus(500);
        }

        res.sendStatus(200);
    });

  } else {  // Neexistuje seznam účtů

    let accountsInChannel = "";   // Sestavení vložení účtů
    userIds.forEach((account) => {
      if(accountsInChannel.length !== 0) accountsInChannel += ",";
      accountsInChannel += `(LAST_INSERT_ID(), '${account}')`;
    });

    pool.getConnection(function(connectionError, connection) {  // DB connection from pool
      if (connectionError) {
        console.log(connectionError);
        res.sendStatus(500);
      }

      connection.beginTransaction(function (transactionError) { // BEGIN TRANSACTION
        if (transactionError) {
          console.log(transactionError);
          res.sendStatus(500);
        }

        connection.query(`INSERT INTO channel(name, description, type) VALUE ('${name}', '${description}', '${type}');`, function (queryError, queryResults, queryFields) {
          if (queryError) {
            console.error(queryError);
            res.sendStatus(500);
          }
        });

        connection.query(`INSERT INTO accountInChannel(channelId, accountId) VALUES ${accountsInChannel};`, function (queryError, queryResults, queryFields) {
          if (queryError) {
            console.error(queryError);
            res.sendStatus(500);
          }
        });

        connection.commit(function (commitError) {  // COMMIT TRANSACTION
          if (commitError) {
            return connection.rollback(function () {
              console.log(commitError);
              res.sendStatus(500);
            });
          }

          res.sendStatus(200);
        });
      });
    });
  }
});


/*
router.get('', (req, res) => {

});
*/



module.exports = router;
