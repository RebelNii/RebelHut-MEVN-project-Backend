const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
const tokenGateway = require('../middleware/verifyToken')


router.use(tokenGateway)

router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser)
    .patch(userController.updateUser)

router.route('/:id')
    .get(userController.getSingUser)
    .delete(userController.deleteUser)

module.exports = router