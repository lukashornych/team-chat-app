const { Router } = require('express');

const router = Router();

// Functions requires
const getAllMessages = require('./messages/getAllMessages');

// Routes
router.get('/getAllMessages/:id', getAllMessages);


module.exports = router;



