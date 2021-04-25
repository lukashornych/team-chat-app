const jwt = require('jsonwebtoken');

//TODO OVĚŘENÍ, ZDA UŽIVATEL Z TOKENU EXISTUJE!
/**
 ** Token authentication function
 ** @param req http request
 ** @param res http response
 ** @param callback
 **/
const authenticateToken = function (req, res, callback) {
  if(!req.cookies["jwt-hs"] || !req.cookies["jwt-payload"]) return res.sendStatus(401);

  const hs = req.cookies["jwt-hs"].split(".");
  if (hs.length !== 2) {
    res.clearCookie("jwt-hs");
    res.clearCookie("jwt-payload");
    return res.status(401).json({error: "Corrupted cookies."});
  }

  const token = hs[0] + "." + req.cookies["jwt-payload"] + "." + hs[1];

  jwt.verify(token, process.env.TOKEN_PRIVATE, (verifyError, user) => {
    if (verifyError) {
      //console.error("JWT Verify Error: " + verifyError);
      res.clearCookie("jwt-hs");
      res.clearCookie("jwt-payload");
      return res.status(403).json({error: verifyError});
    }


    req.user = user;
    callback();
  });
}

module.exports = authenticateToken;
