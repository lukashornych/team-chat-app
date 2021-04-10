const { Router } = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../index').connectionDB;
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
    if (!(req.body.type === ("PRIVATE_GROUP") || req.body.type === "PUBLIC_CHANNEL")) return res.sendStatus(400); // takto funguje, (req.body.type !== ("PRIVATE_GROUP") || req.body.type !== "PUBLIC_CHANNEL") vyhodí error (400)!

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
        console.log(connectionError);
        return res.sendStatus(500);
      }

      connection.beginTransaction(function (transactionError) { // BEGIN TRANSACTION
        if (transactionError) {
          console.log(transactionError);
          return res.sendStatus(500);
        }

        connection.query(`INSERT INTO channel(${insert}) VALUE (${insertValues});`, function (queryError, queryResults, queryFields) {
          if (queryError) {
            console.error(queryError);
            return res.sendStatus(500);
          }
        });

        connection.query(`INSERT INTO accountInChannel(channelId, accountId) VALUES ${accountsInChannel};`, function (queryError, queryResults, queryFields) {
          if (queryError) {
            console.error(queryError);
            return res.sendStatus(500);
          }
        });

        connection.commit(function (commitError) {  // COMMIT TRANSACTION
          if (commitError) {
            return connection.rollback(function () {
              console.log(commitError);
              return res.sendStatus(500);
            });
          }

          res.sendStatus(200);
        });
      });
    });
  });
});



/*
router.get('', (req, res) => {

});
*/

/**
 ** UPDATE CHANNEL
 ** authenticated by token
 **/
router.put('/updateChannel', (req, res) => {
  authenticateToken(req, res, (authenticated) => {
    if (!authenticated) return res.sendStatus(401);

    if (!req.body.id || (!req.body.name && !req.body.description)) return res.sendStatus(400);

    const id = req.body.id;

    let setter = [];  // SET statement creation
    if (req.body.name) setter.push(`name='${req.body.name}'`);
    if (req.body.description) setter.push(`description='${req.body.description}'`);

    pool.query(`UPDATE channel SET ${setter.toString()} WHERE id='${id}' ;`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error(queryError);
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
        console.error(queryError);
        return res.sendStatus(500);
      }

      res.status(200).json(queryResults);
      console.log(queryResults);
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
        console.error(queryError);
        return res.sendStatus(500);
      }

      res.status(200).json(queryResults);
      console.log(queryResults);
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
        console.error(queryError);
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
  authenticateToken(req, res, (authenticated) => {
    if (!authenticated) return res.sendStatus(401);

    if (!req.body.userIds || !req.body.channelId) return res.sendStatus(400);

    const channelId = req.body.channelId;
    const userIds = req.body.userIds;

    if (userIds.length !== 0) {

      let insert = [];
      userIds.forEach((userId) => {
        insert.push(`('${channelId}', '${userId}')`);
      });

      pool.query(`INSERT INTO channelInvitation(channelId, accountId) VALUES ${insert.toString()};`, function (queryError, queryResults, queryFields) {
        if (queryError) {
          console.error(queryError);
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
  authenticateToken(req, res, (authenticated) => {
    if (!authenticated) return res.sendStatus(401);

    const channelId = req.params.channelId;

    pool.query(`SELECT id, name, username FROM account WHERE ` +
                `id NOT IN (SELECT accountId FROM channelInvitation WHERE channelId=${channelId}) ` +
                `AND id NOT IN (SELECT accountId FROM accountInChannel WHERE channelId=${channelId});`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error(queryError);
        return res.sendStatus(500);
      }

      res.status(200).json(queryResults);
    });
  });
});


module.exports = router;
