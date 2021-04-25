const pool = require('../../index').connectionDB;


/**
 ** GET ACCOUNT'S CHANNEL INVITATIONS
 ** authenticated by token
 **/
const getChannelInvitations = (req, res) => {

  const id = req.user.id;

  pool.query(`SELECT ch.id, ch.name, chi.accountId  FROM channel ch JOIN channelInvitation chi ON ch.id=chi.channelId WHERE chi.accountId='${id}' AND accepted='0';`, function (queryError, queryResults, queryFields) {
    if (queryError) {
      console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + queryError.code + "\x1b[0m\n" + queryError.sqlMessage);
      return res.sendStatus(500);
    }

    res.status(200).json(queryResults);
  });
}

module.exports = getChannelInvitations;
