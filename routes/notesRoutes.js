const express = require('express');
const router = express.Router();
const notesController = require('../controller/notesController')
const tokenGateway = require('../middleware/verifyToken')

router.use(tokenGateway)

router.route('/')
    .get(notesController.getAllNotes)
    .post(notesController.createNotes)
    .patch(notesController.updateNote)

router.route('/:id')
    .get(notesController.getSingleNote)
    .delete(notesController.deleteNote)


module.exports = router