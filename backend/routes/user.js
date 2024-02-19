const express = require('express');
const router = express.Router(); //creates express router which we can register routes to. Installed using npm.

const User = require('../models/users');
const userCtrl = require('../controllers/user'); //import the controller

//all your user routes go here.------------------------------------------------------------

// Define a route handler for the root path
// router.get('/', testCtrl.getTest);
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);


module.exports = router;

