const pool = require('../../index').connectionDB;


/**
 ** ACCEPT CHANNEL INVITATION
 ** authenticated by token
 **/
const acceptChannelInvitation = (req, res) => {

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
}

module.exports = acceptChannelInvitation;
