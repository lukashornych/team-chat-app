const { Router } = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../index').connectionDB;
const promisePool = pool.promise();
const authenticateToken = require('../authenticateToken');

const router = Router();

/**
 ** CREATE CHANNEL
 ** authenticated by token
 **/
router.post('/createChannel', (req, res) => {
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
});



/**
 ** UPDATE CHANNEL
 ** authenticated by token
 **/
router.put('/updateChannel', (req, res) => {
  authenticateToken(req, res, async (authenticated) => {
    if (!authenticated) return res.sendStatus(401);

    if (!req.body.id || (!req.body.name && !req.body.description)) return res.sendStatus(400);

    const id = req.body.id;

    // USER cannot update PUBLIC_CHANNEL
    const channelType = await promisePool.query(`SELECT type FROM channel WHERE id=${id};`);
    if (req.user.role === "USER" && channelType[0][0].type === "PUBLIC_CHANNEL") return res.sendStatus(403);

    let setter = [];  // SET statement creation
    if (req.body.name) setter.push(`name='${req.body.name}'`);
    if (req.body.description) setter.push(`description='${req.body.description}'`);

    pool.query(`UPDATE channel SET ${setter.toString()} WHERE id='${id}' ;`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + queryError.code + "\x1b[0m\n" + queryError.sqlMessage);
        return res.sendStatus(500);
      }

      res.sendStatus(200);
    });
  });
});



/**
 ** GET ACCOUNT'S CHANNELS
 ** authenticated by token
 **/
router.get('/getChannels', (req, res) => {
  authenticateToken(req, res, (authenticated) => {
    if (!authenticated) return res.sendStatus(401);

    const id = req.user.id;

    pool.query(`SELECT ch.id, ch.name, ch.description, ch.type FROM channel ch JOIN accountInChannel aich  ON ch.id=aich.channelId WHERE aich.accountId='${id}';`,
      function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + queryError.code + "\x1b[0m\n" + queryError.sqlMessage);
        return res.sendStatus(500);
      }

      res.status(200).json(queryResults);
    });
  });
});


/**
 ** GET ACCOUNT'S CHANNEL INVITATIONS
 ** authenticated by token
 **/
router.get('/getChannelInvitations', (req, res) => {
  authenticateToken(req, res, (authenticated) => {
    if (!authenticated) return res.sendStatus(401);

    const id = req.user.id;

    pool.query(`SELECT ch.id, ch.name, chi.accountId  FROM channel ch JOIN channelInvitation chi ON ch.id=chi.channelId WHERE chi.accountId='${id}' AND accepted='0';`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + queryError.code + "\x1b[0m\n" + queryError.sqlMessage);
        return res.sendStatus(500);
      }

      res.status(200).json(queryResults);
    });
  });
});


/**
 ** ACCEPT CHANNEL INVITATION
 ** authenticated by token
 **/
router.post('/acceptChannelInvitation', (req, res) => {
  authenticateToken(req, res, (authenticated) => {
    if (!authenticated) return res.sendStatus(401);

    if (!req.body.userId || !req.body.channelId) return res.sendStatus(400);

    const userId = req.body.userId;
    const channelId = req.body.channelId;

    pool.query(`CALL acceptChannelInvitation('${channelId}', '${userId}');`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + queryError.code + "\x1b[0m\n" + queryError.sqlMessage);
        return res.sendStatus(500);
      }

      if (queryResults[0][0].output === "done") {
        res.sendStatus(200);
      } else {
        res.sendStatus(403);
      }
    });
  });
});


/**
 ** CREATE CHANNEL INVITATION
 ** authenticated by token
 **/
router.post('/createChannelInvitation', (req, res) => {
  authenticateToken(req, res, async (authenticated) => {
    if (!authenticated) return res.sendStatus(401);

    if (!req.body.userIds || !req.body.channelId) return res.sendStatus(400);

    const channelId = req.body.channelId;
    const userIds = req.body.userIds;

    // User must be in channel
    const isInChannel = await promisePool.query(`SELECT isInChannel(${req.user.id}, ${channelId}) AS output;`);
    if (isInChannel[0][0].output === 0) return res.sendStatus(403);

    // USER cannot update PUBLIC_CHANNEL
    const channelType = await promisePool.query(`SELECT type FROM channel WHERE id=${channelId};`);
    if (req.user.role === "USER" && channelType[0][0].type === "PUBLIC_CHANNEL") return res.sendStatus(403);

    if (userIds.length !== 0) {

      let insert = [];
      userIds.forEach((userId) => {
        insert.push(`('${channelId}', '${userId}')`);
      });

      pool.query(`INSERT INTO channelInvitation(channelId, accountId) VALUES ${insert.toString()};`, function (queryError, queryResults, queryFields) {
        if (queryError) {
          console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + queryError.code + "\x1b[0m\n" + queryError.sqlMessage);
          return res.sendStatus(500);
        }

        res.sendStatus(200);
      });
    }
  });
});



/**
 ** GET ALL INVITABLE ACCOUNTS TO CHANNEL
 ** authenticated by token
 **/
router.get('/getChannelsInvitableAccounts/:channelId', (req, res) => {
  authenticateToken(req, res, async (authenticated) => {
    if (!authenticated) return res.sendStatus(401);

    const channelId = req.params.channelId;

    // USER cannot update PUBLIC_CHANNEL
    const channelType = await promisePool.query(`SELECT type FROM channel WHERE id=${channelId};`);
    if (req.user.role === "USER" && channelType[0][0].type === "PUBLIC_CHANNEL") return res.sendStatus(403);

    pool.query(`SELECT id, name, username FROM account WHERE ` +
                `id NOT IN (SELECT accountId FROM channelInvitation WHERE channelId=${channelId}) ` +
                `AND id NOT IN (SELECT accountId FROM accountInChannel WHERE channelId=${channelId});`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + queryError.code + "\x1b[0m\n" + queryError.sqlMessage);
        return res.sendStatus(500);
      }

      res.status(200).json(queryResults);
    });
  });
});


module.exports = router;
