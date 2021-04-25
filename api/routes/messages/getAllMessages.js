const pool = require('../../index').connectionDB;
const promisePool = pool.promise();


/**
 ** GET ALL MESSAGES
 ** authenticated by token
 **/
const getAllMessages = async (req, res) => {

  const id = req.params.id;

  const thread = req.query.thread;

  let dotaz = "";
  if (thread === "true") {
    const isInThread = await promisePool.query(`SELECT isInThread(${req.user.id}, ${id}) AS output;`);
    if (isInThread[0][0].output === 0) return res.sendStatus(403);
    dotaz = `WHERE t.id=${id}`;

  } else {
    const isInChannel = await promisePool.query(`SELECT isInChannel(${req.user.id}, ${id}) AS output;`);
    if (isInChannel[0][0].output === 0) return res.sendStatus(403);
    dotaz = `WHERE ch.id=${id}`;
  }

  pool.query(`SELECT m.id AS messageId, m.threadId, m.created, m.content, a.id AS accountId, a.name, a.username ` +
    `FROM channel ch JOIN thread t ON t.channelId=ch.id `+
    `JOIN message m ON m.threadId=t.id ` +
    `JOIN account a ON m.creatorId=a.id ` +
    `${dotaz} ORDER BY m.id DESC;`, function (queryError, queryResults, queryFields) {
    if (queryError) {
      console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + queryError.code + "\x1b[0m\n" + queryError.sqlMessage);
      return res.sendStatus(500);
    }

    let ret = [];
    queryResults.forEach((result) => {
      ret.push({
        "id" : result.messageId,
        "threadId" : result.threadId,
        "creator" : {
          "id" : result.accountId,
          "name" : result.name,
          "username" : result.username
        },
        "created" : result.created,
        "content" : result.content
      });
    });

    res.status(200).json(ret);
  });
}


module.exports = getAllMessages;
