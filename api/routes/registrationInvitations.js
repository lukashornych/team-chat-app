const { Router } = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../index').connectionDB;

const router = Router();

const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 ** GET ALL REGISTRATION INVITATIONS
 ** authenticated by token
 **/
router.get('/getAllRegistrationInvitations', (req, res) => {
  authenticateToken(req, res, (authenticated) => {
    if (!authenticated) return res.sendStatus(403);

    pool.query(`SELECT id, code, accepted  FROM registrationInvitation;`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error(queryError);
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
    if (!authenticated) return res.sendStatus(403);

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
        console.error(queryError);
        res.sendStatus(500);
      }

      res.sendStatus(200);
    });
  });
});


module.exports = router;


  /**
   ** Token authentication function
   ** @param req
   ** @param res
   ** @param callback
   **/
  const authenticateToken = function (req, res, callback) {
    if(!req.cookies["jwt-hs"] || !req.cookies["jwt-payload"]) return callback(false);

    const hs = req.cookies["jwt-hs"].split(".");

    let token;
    if (hs.length === 2) {
      token = hs[0] + "." + req.cookies["jwt-payload"] + "." + hs[1];
    }


    if(token == null) {
      res.clearCookie("jwt-hs");
      res.clearCookie("jwt-payload");
      return callback(false);
    }

    jwt.verify(token, process.env.TOKEN_PRIVATE, (verifyError, user) => {
      if (verifyError) {
        console.error(verifyError);
        //return res.sendStatus(403);
        res.clearCookie("jwt-hs");
        res.clearCookie("jwt-payload");
        return callback(false);
      }

      req.user = user;
      callback(true);
    });
  }




function generateString(length) {
  let result = "";

  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}
