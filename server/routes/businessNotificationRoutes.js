const express = require('express');
const router = express.Router();
const NotificationService = require('../services/notificationService');
const { protect, authorize } = require('../middlewares/authmiddleware');

// Todas las rutas requieren autenticación y solo administradores pueden crear notificaciones
router.use(protect);
router.use(authorize('admin'));

/**
 * Crear recordatorio médico
 * POST /api/business-notifications/medical-reminder
 */
router.post('/medical-reminder', async (req, res) => {
  try {
    const { historyId, title, message, scheduledDate, priority } = req.body;

    if (!historyId) {
      return res.status(400).json({
        message: 'El ID del historial médico es requerido'
      });
    }

    const count = await NotificationService.createMedicalReminder(historyId, {
      title,
      message,
      scheduledDate,
      priority
    });

    res.status(201).json({
      message: `Recordatorio médico creado exitosamente`,
      notificationsCreated: count
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear recordatorio médico',
      error: error.message
    });
  }
});

/**
 * Crear recordatorio de cita
 * POST /api/business-notifications/appointment-reminder
 */
router.post('/appointment-reminder', async (req, res) => {
  try {
    const { petName, ownerName, appointmentDate, appointmentType, veterinarian, priority } = req.body;

    if (!petName || !ownerName || !appointmentDate || !appointmentType) {
      return res.status(400).json({
        message: 'Los campos petName, ownerName, appointmentDate y appointmentType son requeridos'
      });
    }

    const count = await NotificationService.createAppointmentReminder({
      petName,
      ownerName,
      appointmentDate: new Date(appointmentDate),
      appointmentType,
      veterinarian,
      priority
    });

    res.status(201).json({
      message: `Recordatorio de cita creado exitosamente`,
      notificationsCreated: count
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear recordatorio de cita',
      error: error.message
    });
  }
});

/**
 * Crear alerta de vacunación
 * POST /api/business-notifications/vaccination-alert
 */
router.post('/vaccination-alert', async (req, res) => {
  try {
    const { petName, ownerName, vaccineName, dueDate, priority } = req.body;

    if (!petName || !ownerName || !vaccineName || !dueDate) {
      return res.status(400).json({
        message: 'Los campos petName, ownerName, vaccineName y dueDate son requeridos'
      });
    }

    const count = await NotificationService.createVaccinationAlert({
      petName,
      ownerName,
      vaccineName,
      dueDate: new Date(dueDate),
      priority
    });

    res.status(201).json({
      message: `Alerta de vacunación creada exitosamente`,
      notificationsCreated: count
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear alerta de vacunación',
      error: error.message
    });
  }
});

/**
 * Crear alerta de desparasitación
 * POST /api/business-notifications/deworming-alert
 */
router.post('/deworming-alert', async (req, res) => {
  try {
    const { petName, ownerName, productName, dueDate, priority } = req.body;

    if (!petName || !ownerName || !productName || !dueDate) {
      return res.status(400).json({
        message: 'Los campos petName, ownerName, productName y dueDate son requeridos'
      });
    }

    const count = await NotificationService.createDewormingAlert({
      petName,
      ownerName,
      productName,
      dueDate: new Date(dueDate),
      priority
    });

    res.status(201).json({
      message: `Alerta de desparasitación creada exitosamente`,
      notificationsCreated: count
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear alerta de desparasitación',
      error: error.message
    });
  }
});

/**
 * Crear alerta de seguimiento de tratamiento
 * POST /api/business-notifications/treatment-followup
 */
router.post('/treatment-followup', async (req, res) => {
  try {
    const {
      petName,
      ownerName,
      treatmentName,
      currentDose,
      totalDoses,
      nextDoseDate,
      priority
    } = req.body;

    if (!petName || !ownerName || !treatmentName || !currentDose || !totalDoses || !nextDoseDate) {
      return res.status(400).json({
        message: 'Todos los campos son requeridos para el seguimiento de tratamiento'
      });
    }

    const count = await NotificationService.createTreatmentFollowUp({
      petName,
      ownerName,
      treatmentName,
      currentDose: parseInt(currentDose),
      totalDoses: parseInt(totalDoses),
      nextDoseDate: new Date(nextDoseDate),
      priority
    });

    res.status(201).json({
      message: `Alerta de seguimiento de tratamiento creada exitosamente`,
      notificationsCreated: count
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear alerta de seguimiento de tratamiento',
      error: error.message
    });
  }
});

/**
 * Crear alerta de cumpleaños de mascota
 * POST /api/business-notifications/pet-birthday
 */
router.post('/pet-birthday', async (req, res) => {
  try {
    const { petName, ownerName, birthday, age, priority } = req.body;

    if (!petName || !ownerName || !birthday || !age) {
      return res.status(400).json({
        message: 'Los campos petName, ownerName, birthday y age son requeridos'
      });
    }

    const count = await NotificationService.createPetBirthdayAlert({
      petName,
      ownerName,
      birthday: new Date(birthday),
      age: parseInt(age),
      priority
    });

    res.status(201).json({
      message: `Alerta de cumpleaños creada exitosamente`,
      notificationsCreated: count
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear alerta de cumpleaños',
      error: error.message
    });
  }
});

/**
 * Crear alerta de producto próximo a vencer
 * POST /api/business-notifications/expiring-product
 */
router.post('/expiring-product', async (req, res) => {
  try {
    const { productName, productType, expiryDate, daysUntilExpiry, priority } = req.body;

    if (!productName || !productType || !expiryDate || !daysUntilExpiry) {
      return res.status(400).json({
        message: 'Los campos productName, productType, expiryDate y daysUntilExpiry son requeridos'
      });
    }

    const count = await NotificationService.createExpiringProductAlert({
      productName,
      productType,
      expiryDate: new Date(expiryDate),
      daysUntilExpiry: parseInt(daysUntilExpiry),
      priority
    });

    res.status(201).json({
      message: `Alerta de producto próximo a vencer creada exitosamente`,
      notificationsCreated: count
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear alerta de producto próximo a vencer',
      error: error.message
    });
  }
});

/**
 * Crear alerta de mantenimiento del sistema
 * POST /api/business-notifications/system-maintenance
 */
router.post('/system-maintenance', async (req, res) => {
  try {
    const { title, message, scheduledDate, estimatedDuration, priority } = req.body;

    if (!scheduledDate) {
      return res.status(400).json({
        message: 'La fecha programada es requerida'
      });
    }

    const count = await NotificationService.createSystemMaintenanceAlert({
      title,
      message,
      scheduledDate: new Date(scheduledDate),
      estimatedDuration,
      priority
    });

    res.status(201).json({
      message: `Alerta de mantenimiento creada exitosamente`,
      notificationsCreated: count
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear alerta de mantenimiento',
      error: error.message
    });
  }
});

/**
 * Crear alerta personalizada para un usuario específico
 * POST /api/business-notifications/custom-user-alert/:userId
 */
router.post('/custom-user-alert/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, message, type, priority, data } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        message: 'Los campos title y message son requeridos'
      });
    }

    const notification = await NotificationService.createCustomUserAlert(userId, {
      title,
      message,
      type,
      priority,
      data
    });

    res.status(201).json({
      message: `Alerta personalizada creada exitosamente`,
      notification
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear alerta personalizada',
      error: error.message
    });
  }
});

/**
 * Obtener estadísticas específicas del negocio
 * GET /api/business-notifications/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await NotificationService.getBusinessNotificationStats();

    res.status(200).json({
      stats
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener estadísticas de negocio',
      error: error.message
    });
  }
});

module.exports = router;