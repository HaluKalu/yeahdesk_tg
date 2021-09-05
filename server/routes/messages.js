const express = require('express');
const router = express.Router();

const controller = require('../controllers/messages');

router.post('/', controller.create);
router.get('/get', controller.get);
router.get('/users', controller.getAllUsers);
router.post('/update', controller.update);
module.exports = router;
