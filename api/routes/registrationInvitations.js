const { Router } = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../index').connectionDB;

const authenticateToken = require('../authenticateToken');


const router = Router();

// Functions requires
const getAllRegistrationInvitations = require('./registrationInvitations/getAllRegistrationInvitations');
const generateRegistrationInvitation = require('./registrationInvitations/generateRegistrationInvitation');

// Routes
router.get('/getAllRegistrationInvitations', authenticateToken, getAllRegistrationInvitations);
router.post('/generateRegistrationInvitation', authenticateToken, generateRegistrationInvitation);


module.exports = router;


