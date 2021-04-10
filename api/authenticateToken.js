const jwt = require('jsonwebtoken');

//TODO OVĚŘENÍ, ZDA UŽIVATEL Z TOKENU EXISTUJE!
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

module.exports = authenticateToken;
