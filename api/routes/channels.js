const { Router } = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../index').connectionDB;

const router = Router();

/**
 ** NEW CHANNEL
 ** authenticated by token
 **/
router.post('/newChannel', (req, res) => {
  authenticateToken(req, res, (authenticated) => {
    if (!authenticated) return res.sendStatus(403);

    if (!req.body.type || !req.body.name || !req.body.description) return res.sendStatus(400);
    if (req.body.type !== ("PRIVATE_GROUP" || "PUBLIC_CHANNEL")) return res.sendStatus(400);

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

      let accountsInChannel = `(LAST_INSERT_ID(), '${req.user.id}')`;   // Sestavení vložení účtů
      userIds.forEach((account) => {
        accountsInChannel += `,(LAST_INSERT_ID(), '${account}')`;
      });

      pool.getConnection(function (connectionError, connection) {  // DB connection from pool
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
    if (!authenticated) return res.sendStatus(403);

    if (!req.body.id || !req.body.name || !req.body.description) return res.sendStatus(400);

    const id = req.body.id;
    const name = req.body.name;
    const description = req.body.description;

    pool.query(`UPDATE channel SET name='${name}', description='${description}' WHERE id='${id}' ;`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error(queryError);
        res.sendStatus(500);
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
    if (!authenticated) return res.sendStatus(403);

    const id = req.user.id;

    pool.query(`SELECT ch.id, ch.name, ch.description, ch.type FROM channel ch JOIN accountInChannel aich  ON ch.id=aich.channelId WHERE aich.accountId='${id}' UNION
    SELECT id, name, description, type FROM channel WHERE type='PUBLIC_CHANNEL';`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error(queryError);
        res.sendStatus(500);
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
    if (!authenticated) return res.sendStatus(403);

    const id = req.user.id;

    pool.query(`SELECT ch.id, ch.name  FROM channel ch JOIN channelInvitation chi ON ch.id=chi.channelId WHERE chi.accountId='${id}' AND accepted='0';`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error(queryError);
        res.sendStatus(500);
      }

      res.status(200).json(queryResults);
      console.log(queryResults);
    });
  });
/*
  DELIMITER $$
  CREATE PROCEDURE `registerAccount`(IN in_channelId INT, IN in_accountId INT)
  BEGIN
  DECLARE count_invitations INT;
  DECLARE decl_invId INT;

  SELECT COUNT(*) INTO count_invitations FROM channelInvitation WHERE channelId=in_channelId AND accountId=in_accountId AND accepted=0;

  IF count_invitations != 0 THEN
  SELECT MIN(id) INTO decl_invId FROM channelInvitation WHERE channelId=in_channelId AND accountId=in_accountId AND accepted=0;
  UPDATE channelInvitation SET accepted=1 WHERE id=decl_invId;
  INSERT INTO accountInChannel() VALUE ();
  END IF;
  END
  $$ DELIMITER;
  */
});


/**
 ** GET ACCOUNT'S CHANNEL INVITATIONS
 ** authenticated by token
 **/
router.post('/acceptChannelInvitation', (req, res) => {
  authenticateToken(req, res, (authenticated) => {
    if (!authenticated) return res.sendStatus(403);

    if (!req.body.userId || !req.body.channelId) return res.sendStatus(400);

    const userId = req.body.userId;
    const channelId = req.body.channelId;

    pool.query(`SELECT ch.id, ch.name  FROM channel ch JOIN channelInvitation chi ON ch.id=chi.channelId WHERE chi.accountId='${id}' AND accepted='0';`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error(queryError);
        res.sendStatus(500);
      }

      res.status(200).json(queryResults);
      console.log(queryResults);
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
