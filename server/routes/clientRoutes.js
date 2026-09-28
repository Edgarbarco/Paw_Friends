const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoute');

// Registrar las rutas de autenticación
router.use('/auth', authRoutes);

module.exports = router;
