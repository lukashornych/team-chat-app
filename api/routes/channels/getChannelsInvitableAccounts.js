const pool = require('../../index').connectionDB;
const promisePool = pool.promise();


/**
 ** GET ALL INVITABLE ACCOUNTS TO CHANNEL
 ** authenticated by token
 **/
const getChannelsInvitableAccounts = async (req, res) => {

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
}



module.exports = getChannelsInvitableAccounts;
