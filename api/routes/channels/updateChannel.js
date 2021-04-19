const pool = require('../../index').connectionDB;
const promisePool = pool.promise();
const authenticateToken = require('../../authenticateToken');


/**
 ** UPDATE CHANNEL
 ** authenticated by token
 **/
const updateChannel = (req, res) => {

  authenticateToken(req, res, async (authenticated) => {
    if (!authenticated) return res.sendStatus(401);

    if (!req.body.id || (!req.body.name && !req.body.description)) return res.sendStatus(400);

    const id = req.body.id;

    // USER cannot update PUBLIC_CHANNEL
    const channelType = await promisePool.query(`SELECT type FROM channel WHERE id=${id};`);
    if (req.user.role === "USER" && channelType[0][0].type === "PUBLIC_CHANNEL") return res.sendStatus(403);

    let setter = [];  // SET statement creation
    if (req.body.name) setter.push(`name='${req.body.name}'`);
    if (req.body.description) setter.push(`description='${req.body.description}'`);

    pool.query(`UPDATE channel SET ${setter.toString()} WHERE id='${id}' ;`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + queryError.code + "\x1b[0m\n" + queryError.sqlMessage);
        return res.sendStatus(500);
      }

      res.sendStatus(200);
    });
  });
}

module.exports = updateChannel;
