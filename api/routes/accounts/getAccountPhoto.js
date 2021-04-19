const authenticateToken = require('../../authenticateToken');
const pool = require('../../index').connectionDB;


/**
 ** GET ACCOUNT PHOTO
 ** authenticated by token
 **/
const getAccountPhoto = (req, res) => {
  authenticateToken(req, res, (authenticated) => {
    if (!authenticated) return res.sendStatus(401);

    const id = req.params.id;

    pool.query(`SELECT data FROM photo p JOIN accountInPhoto aip ON p.id=aip.photoId WHERE aip.accountId=${id};`, function (queryError, queryResults, queryFields) {
      if (queryError) {
        console.error("\n\x1b[31mQuery error! \x1b[0m\x1b[32m" + queryError.code + "\x1b[0m\n" + queryError.sqlMessage);
        return res.sendStatus(500);
      }

      if (queryResults[0]) {
        const img = Buffer.from(queryResults[0].data.toString(), "base64");

        res.writeHead(200, {
          'Content-Type': 'image/jpg',
          'Content-Length': img.length
        });

        res.end(img);

      } else {
        const img = Buffer.from(process.env.DEFAULT_BASE64_PHOTO, 'base64');

        res.writeHead(200, {
          'Content-Type': 'image/jpg',
          'Content-Length': img.length
        });

        res.end(img);
      }

    });
  });
}

module.exports = getAccountPhoto;
