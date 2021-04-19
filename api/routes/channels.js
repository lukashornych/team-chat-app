const { Router } = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../index').connectionDB;
const promisePool = pool.promise();
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
router.post('/createChannel', createChannel);
router.put('/updateChannel', updateChannel);
router.get('/getChannels', getChannels);
router.get('/getChannelInvitations', getChannelInvitations);
router.post('/acceptChannelInvitation', acceptChannelInvitation);
router.post('/createChannelInvitation', createChannelInvitation);
router.get('/getChannelsInvitableAccounts/:channelId', getChannelsInvitableAccounts);


module.exports = router;



/*
const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../index').connectionDB;
const authenticateToken = require('../../authenticateToken');
const base64 = require('base64-js');
 */
