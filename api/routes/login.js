const { express, Router } = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql');

const router = Router();

const pool = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.DB_HOST,
  port            : process.env.DB_PORT,
  user            : process.env.DB_USER,
  password        : process.env.DB_PASSWORD,
  database        : process.env.DB_DATABASE
});


// POST login
router.post('/login', (req, res) => {
  if (!req.body.username || !req.body.password) return res.sendStatus(400);

  pool.query(`SELECT * FROM account WHERE username='${req.body.username}'`, function (error, results, fields) {
    if (error) {
      console.error(error);
      return res.sendStatus(500); //??????????
    }

    bcrypt.compare(req.body.password, results[0].passwordHash, (compareError, compareResult) => {
      if (compareError) {
        console.error(compareError);
        return res.sendStatus(500); //??????????
      }
      if (compareResult) {
        res.status(200).send(results[0]);  //??????????
      } else {
        res.sendStatus(400);  //??????????
      }
    });
  });
});


// POST createAdmin - DEBUG!
router.post('/createAdmin', (req, res) => {
  if (!req.body.username || !req.body.password) return res.sendStatus(400);

  bcrypt.hash(req.body.password, 10, (hashError, hash) => {
    console.log("hešlo to");
    if(hashError) {
      console.log(hashError);
      return res.sendStatus(500);
    }

    pool.query(`INSERT INTO account (username, name, passwordHash, role) values ('${req.body.username}', 'ADMIN', '${hash}', 'ADMIN');`, function (queryError, results, fields) {
      if (queryError) {
        console.error(queryError);
        return res.sendStatus(500); //??????????
      }
      console.log("WTF");
      res.sendStatus(200);  //??????????
    });
  });
});



router.get('/detest', (req, res) => {
  pool.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);
    res.sendStatus(200);
  });
});

module.exports = router;
