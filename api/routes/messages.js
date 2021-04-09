const { Router } = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../index').connectionDB;
//const io = require('socket.io')(process.env.PORT);
const authenticateToken = require('../authenticateToken');

const router = Router();


/**
 ** GET ALL MESSAGES
 ** authenticated by token
 **/
router.get('/getAllMessages', (req, res) => {
  authenticateToken(req, res, (authenticated) => {
    if (!authenticated) return res.sendStatus(403);

    if (!req.body.channelId) res.sendStatus(400);

    const channelId = req.body.channelId;

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




/*io.on("connection", socket => {
  // either with send()
  socket.send("Hello!");

  // or with emit() and custom event names


  // handle the event sent with socket.send()
  socket.on("message", (data) => {
    console.log(data);
  });

  // handle the event sent with socket.emit()
  socket.on("newMessage", () => {

    pool.query(`SELECT id, code, accepted  FROM registrationInvitation;`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error(queryError);
      }
    });

    const emit = {
      channelId: 1,
      threadId: 2,
      creatorId: 3,
      content: 'message'
    }
    socket.emit("newMessage", emit);
  });
});*/



