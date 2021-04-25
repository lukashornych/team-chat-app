const { Router } = require('express');

const authenticateToken = require('../authenticateToken');


const router = Router();


// Functions requires
const register = require('./accounts/register');
const login = require('./accounts/login');
const logout = require('./accounts/logout');
const updateAccount = require('./accounts/updateAccount');
const getAllAccounts = require('./accounts/getAllAccounts');
const getAccountPhoto = require('./accounts/getAccountPhoto');

// Routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateToken, logout);
router.put('/updateAccount', authenticateToken, updateAccount);
router.get('/getAllAccounts', authenticateToken, getAllAccounts);
router.get('/getAccountPhoto/:id', authenticateToken, getAccountPhoto);


module.exports = router;


// POST createAdmin - DEBUG!
// router.post('/createAdmin', (req, res) => {
//   if (!req.body.username || !req.body.password) return res.sendStatus(400);
//
//   bcrypt.hash(req.body.password, 10, (hashError, hash) => {
//     if(hashError) {
//       console.error(hashError);
//       return res.sendStatus(500);
//     }
//
//     pool.query(`INSERT INTO account (username, name, passwordHash, role) values ('${req.body.username}', 'ADMIN', '${hash}', 'ADMIN');`, function (queryError, results, fields) {
//       if (queryError) {
//         console.error("Someone tried to create 'admin' account!");
//         return res.sendStatus(500);
//       }
//       res.sendStatus(201);
//     });
//   });
// });




