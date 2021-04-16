const { Router } = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../index').connectionDB;
const authenticateToken = require('../authenticateToken');

const router = Router();

const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 ** GET ALL REGISTRATION INVITATIONS
 ** authenticated by token
 **/
router.get('/getAllRegistrationInvitations', (req, res) => {
  authenticateToken(req, res, (authenticated) => {
    if (!authenticated) return res.sendStatus(401);

    // only ADMIN can see registration invitation
    if (req.user.role !== "ADMIN") return res.sendStatus(403);

    pool.query(`SELECT id, code, accepted  FROM registrationInvitation where accepted = false;`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + queryError.code + "\x1b[0m\n" + queryError.sqlMessage);
        res.sendStatus(500);
      }

      res.status(200).json(queryResults);
    });
  });
});


/**
 ** GENERATE REGISTRATION INVITATION
 ** authenticated by token
 **/
router.post('/generateRegistrationInvitation', (req, res) => {
  authenticateToken(req, res, (authenticated) => {
    if (!authenticated) return res.sendStatus(401);

    // only ADMIN can create registration invitation
    if (req.user.role !== "ADMIN") return res.sendStatus(403);

    const amount = req.body.amount;

    let insert = `('${generateString(10)}')`;

    if(amount && amount > 1) {
      let array = [];
      for(let i = 0; i < amount; i++)
        array.push(`('${generateString(10)}')`);
      insert += "," + array.toString();
    }

    generateString(10);

    pool.query(`INSERT INTO registrationInvitation(code) VALUES ${insert};`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + queryError.code + "\x1b[0m\n" + queryError.sqlMessage);
        res.sendStatus(500);
      }

      res.sendStatus(200);
    });
  });
});


module.exports = router;


function generateString(length) {
  let result = "";

  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}
