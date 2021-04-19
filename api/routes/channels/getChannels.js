const pool = require('../../index').connectionDB;
const authenticateToken = require('../../authenticateToken');


/**
 ** GET ACCOUNT'S CHANNELS
 ** authenticated by token
 **/
const getChannels = (req, res) => {

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
}

module.exports = getChannels;
