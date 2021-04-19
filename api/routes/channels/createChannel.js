const pool = require('../../index').connectionDB;
const authenticateToken = require('../../authenticateToken');


/**
 ** CREATE CHANNEL
 ** authenticated by token
 **/
const createChannel = (req, res) => {

  authenticateToken(req, res, (authenticated) => {
    if (!authenticated) return res.sendStatus(401);

    if (!req.body.type || !req.body.name) return res.sendStatus(400);
    if (!(req.body.type === "PRIVATE_GROUP" || req.body.type === "PUBLIC_CHANNEL")) return res.sendStatus(400); // takto funguje, (req.body.type !== ("PRIVATE_GROUP") || req.body.type !== "PUBLIC_CHANNEL") vyhodí error (400)!

    if (req.user.role === "USER" && req.body.type === "PUBLIC_CHANNEL") return res.sendStatus(403);

    const type = req.body.type;
    const name = req.body.name;
    const description = req.body.description;
    const userIds = req.body.userIds;

    // 1st insert inputs
    let insert = "name, type";
    let insertValues = `'${name}', '${type}'`;

    if (description) {
      insert += ", description";
      insertValues += `, '${description}'`;
    }

    // 2nd insert inputs
    let accountsInChannel = `(LAST_INSERT_ID(), '${req.user.id}')`;   // Sestavení vložení účtů
    if (userIds) {
      userIds.forEach((account) => {
        accountsInChannel += `,(LAST_INSERT_ID(), '${account}')`;
      });
    }

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

        connection.query(`INSERT INTO channel(${insert}) VALUE (${insertValues});`, function (queryError, queryResults, queryFields) {
          if (queryError) {
            console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + queryError.code + "\x1b[0m\n" + queryError.sqlMessage);
            return res.sendStatus(500);
          }
        });

        connection.query(`INSERT INTO accountInChannel(channelId, accountId) VALUES ${accountsInChannel};`, function (queryError, queryResults, queryFields) {
          if (queryError) {
            console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + queryError.code + "\x1b[0m\n" + queryError.sqlMessage);
            return res.sendStatus(500);
          }
        });

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

module.exports = createChannel;
