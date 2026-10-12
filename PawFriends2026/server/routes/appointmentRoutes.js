const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect, authorize } = require('../middlewares/authmiddleware');

// Todas las rutas requieren autenticación
router.use(protect);

// Rutas públicas para usuarios autenticados
router.get('/', appointmentController.getAllAppointments);
router.get('/today', appointmentController.getTodayAppointments);
router.get('/upcoming', appointmentController.getUpcomingAppointments);
router.get('/:id', appointmentController.getAppointmentById);

// Rutas para veterinarios y administradores
router.post('/', authorize('admin'), appointmentController.createAppointment);
router.put('/:id', authorize('admin'), appointmentController.updateAppointment);
router.delete('/:id', authorize('admin'), appointmentController.deleteAppointment);
router.put('/:id/status', authorize('admin'), appointmentController.updateAppointmentStatus);

// Rutas específicas
router.get('/veterinarian/:veterinarian', appointmentController.getAppointmentsByVeterinarian);

// Estadísticas (solo administradores)
router.get('/admin/stats', authorize('admin'), appointmentController.getAppointmentStats);

module.exports = router;