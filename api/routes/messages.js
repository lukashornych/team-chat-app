const { express, Router } = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../index').connectionDB;
const app = require('../index').app;
const authenticateToken = require('../authenticateToken');

const router = Router();

/**
 ** GET ALL MESSAGES
 ** authenticated by token
 **/
router.get('/getAllMessages/:channelId', (req, res) => {
  authenticateToken(req, res, (authenticated) => {
    if (!authenticated) return res.sendStatus(401);

    const channelId = req.params.channelId;

    pool.query(`SELECT m.id AS messageId, m.threadId, m.created, m.content, a.id AS accountId, a.name, a.username ` +
                `FROM channel ch JOIN thread t ON t.channelId=ch.id `+
                `JOIN message m ON m.threadId=t.id ` +
                `JOIN account a ON m.creatorId=a.id ` +
                `WHERE ch.id=${channelId} ORDER BY m.threadId, m.created DESC;`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error(queryError);
        res.sendStatus(500);
      }

      let ret = [];
      queryResults.forEach((result) => {
        console.log(result);
        ret.push({
          "id" : result.messageId,
          "threadId" : result.threadId,
          "creator" : {
            "id" : result.messageId,
            "name" : result.name,
            "username" : result.username
          },
          "created" : result.created,
          "content" : result.content
        });
      });

      res.status(200).json(ret);
    });
  });
});


module.exports = router;



