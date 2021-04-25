

/**
 ** LOGOUT
 **/
const logout = (req, res) => {

  res.clearCookie("jwt-hs");
  res.clearCookie("jwt-payload");

  res.sendStatus(200);
}

module.exports = logout;
