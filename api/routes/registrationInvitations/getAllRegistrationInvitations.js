const pool = require('../../index').connectionDB;


/**
 ** GET ALL REGISTRATION INVITATIONS
 ** authenticated by token
 **/
const getAllRegistrationInvitations = (req, res) => {

  // only ADMIN can see registration invitations
  if (req.user.role !== "ADMIN") return res.sendStatus(403);

  pool.query(`SELECT * FROM allRegistrationInvitations;`, function (queryError, queryResults, queryFields) {
    if (queryError) {
      console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + queryError.code + "\x1b[0m\n" + queryError.sqlMessage);
      res.sendStatus(500);
    }

    res.status(200).json(queryResults);
  });
}

  module.exports = getAllRegistrationInvitations;
