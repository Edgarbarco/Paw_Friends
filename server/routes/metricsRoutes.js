const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metricsController');
const { protect, authorize } = require('../middlewares/authmiddleware');

// Todas las rutas requieren autenticación
router.use(protect);

// Obtener métricas generales del dashboard
router.get('/dashboard', metricsController.getDashboardMetrics);

// Obtener métricas específicas de citas
router.get('/appointments', metricsController.getAppointmentMetrics);

// Obtener métricas específicas de productos
router.get('/products', metricsController.getProductMetrics);

// Obtener métricas específicas de mascotas
router.get('/pets', metricsController.getPetMetrics);

// Obtener métricas financieras
router.get('/financial', metricsController.getFinancialMetrics);

module.exports = router;