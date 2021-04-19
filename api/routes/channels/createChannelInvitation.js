const pool = require('../../index').connectionDB;
const promisePool = pool.promise();
const authenticateToken = require('../../authenticateToken');


/**
 ** CREATE CHANNEL INVITATION
 ** authenticated by token
 **/
const createChannelInvitation = (req, res) => {

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
}

module.exports = createChannelInvitation;
