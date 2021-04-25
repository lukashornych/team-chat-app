const { Router } = require('express');

const authenticateToken = require('../authenticateToken');


const router = Router();

// Functions requires
const createChannel = require('./channels/createChannel');
const updateChannel = require('./channels/updateChannel');
const getChannels = require('./channels/getChannels');
const getChannelInvitations = require('./channels/getChannelInvitations');
const acceptChannelInvitation = require('./channels/acceptChannelInvitation');
const createChannelInvitation = require('./channels/createChannelInvitation');
const getChannelsInvitableAccounts = require('./channels/getChannelsInvitableAccounts');

// Routes
router.post('/createChannel', authenticateToken, createChannel);
router.put('/updateChannel', authenticateToken, updateChannel);
router.get('/getChannels', authenticateToken, getChannels);
router.get('/getChannelInvitations', authenticateToken, getChannelInvitations);
router.post('/acceptChannelInvitation', authenticateToken, acceptChannelInvitation);
router.post('/createChannelInvitation', authenticateToken, createChannelInvitation);
router.get('/getChannelsInvitableAccounts/:channelId', authenticateToken, getChannelsInvitableAccounts);


module.exports = router;



/*
const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../index').connectionDB;
const authenticateToken = require('../../authenticateToken');
const base64 = require('base64-js');
 */
