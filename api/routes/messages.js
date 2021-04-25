const { Router } = require('express');

const authenticateToken = require('../authenticateToken');


const router = Router();

// Functions requires
const getAllMessages = require('./messages/getAllMessages');

// Routes
router.get('/getAllMessages/:id', authenticateToken, getAllMessages);


module.exports = router;



