const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');


// POST /api/contacto
router.post('/', contactController.createContact);

// GET /api/contacto
router.get('/', contactController.getContacts);

// DELETE /api/contacto/:id
router.delete('/:id', contactController.deleteContact);

// PUT /api/contacto/:id/estado
router.put('/:id/estado', contactController.updateContactStatus);

module.exports = router;
