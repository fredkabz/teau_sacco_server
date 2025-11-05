const express = require('express');
const router = express.Router();
const authenticationController = require('../controllers/authenticationController');
const {validateToken} = require("../util/authentication");

router.post('/login', authenticationController.login_post);
router.get("/login_get", authenticationController.login_get);
// router.get("/login_get_test",authenticationController.login_get_test);
router.get('/logout',authenticationController.logout_get);

router.post('/register', authenticationController.register_post);

// router.get('/profile',authenticationController.profile);

module.exports = router;