const authenticateToken = require('../../authenticateToken');

/**
 ** LOGOUT
 **/
const logout = (req, res) => {
  authenticateToken(req, res, (authenticated) => {
    if (!authenticated) return res.sendStatus(401);

    res.clearCookie("jwt-hs");
    res.clearCookie("jwt-payload");

    res.sendStatus(200);
  });
}

module.exports = logout;
