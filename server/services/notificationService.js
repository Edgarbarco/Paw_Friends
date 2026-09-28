const Notification = require('../models/notificationModel');
const History = require('../models/historyModel');
const User = require('../models/UserModel');
const { notifyAdmins, notifyAllUsers } = require('../middlewares/notificationMiddleware');

/**
 * Servicio para manejar notificaciones específicas del negocio veterinario
 */
class NotificationService {

  /**
   * Crear recordatorio médico para una mascota
   */
  static async createMedicalReminder(historyId, reminderData) {
    try {
      const { title, message, scheduledDate, priority = 'medium' } = reminderData;

      // Obtener el historial médico
      const history = await History.findById(historyId);
      if (!history) {
        throw new Error('Historial médico no encontrado');
      }

      // Crear notificación para todos los administradores
      const admins = await User.find({ role: 'admin' });

      const notifications = admins.map(admin => ({
        title: title || `Recordatorio médico: ${history.petName}`,
        message: message || `Recordatorio médico para ${history.petName} (${history.ownerName})`,
        type: 'medical_reminder',
        recipient: admin._id,
        relatedHistory: historyId,
        priority,
        data: {
          petName: history.petName,
          ownerName: history.ownerName,
          medication: history.medication,
          weight: history.weight,
          scheduledDate,
        }
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        console.log(`Recordatorio médico creado para ${history.petName}`);
      }

      return notifications.length;
    } catch (error) {
      console.error('Error creando recordatorio médico:', error);
      throw error;
    }
  }

  /**
   * Crear recordatorio de cita próxima
   */
  static async createAppointmentReminder(appointmentData) {
    try {
      const {
        petName,
        ownerName,
        appointmentDate,
        appointmentType,
        veterinarian,
        priority = 'high'
      } = appointmentData;

      const title = `Cita próxima: ${petName}`;
      const message = `Cita de ${appointmentType} para ${petName} (${ownerName}) el ${appointmentDate.toLocaleDateString()}`;

      // Crear notificación para todos los administradores
      const admins = await User.find({ role: 'admin' });

      const notifications = admins.map(admin => ({
        title,
        message,
        type: 'appointment_reminder',
        recipient: admin._id,
        priority,
        data: {
          petName,
          ownerName,
          appointmentDate: appointmentDate.toISOString(),
          appointmentType,
          veterinarian,
        }
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        console.log(`Recordatorio de cita creado para ${petName}`);
      }

      return notifications.length;
    } catch (error) {
      console.error('Error creando recordatorio de cita:', error);
      throw error;
    }
  }

  /**
   * Crear alerta de vacunación pendiente
   */
  static async createVaccinationAlert(petData) {
    try {
      const {
        petName,
        ownerName,
        vaccineName,
        dueDate,
        priority = 'high'
      } = petData;

      const title = `Vacunación pendiente: ${petName}`;
      const message = `La vacuna ${vaccineName} para ${petName} (${ownerName}) está pendiente. Fecha límite: ${dueDate.toLocaleDateString()}`;

      // Crear notificación para todos los administradores
      const admins = await User.find({ role: 'admin' });

      const notifications = admins.map(admin => ({
        title,
        message,
        type: 'medical_reminder',
        recipient: admin._id,
        priority,
        data: {
          petName,
          ownerName,
          vaccineName,
          dueDate: dueDate.toISOString(),
          alertType: 'vaccination',
        }
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        console.log(`Alerta de vacunación creada para ${petName}`);
      }

      return notifications.length;
    } catch (error) {
      console.error('Error creando alerta de vacunación:', error);
      throw error;
    }
  }

  /**
   * Crear alerta de desparasitación pendiente
   */
  static async createDewormingAlert(petData) {
    try {
      const {
        petName,
        ownerName,
        productName,
        dueDate,
        priority = 'medium'
      } = petData;

      const title = `Desparasitación pendiente: ${petName}`;
      const message = `Desparasitación con ${productName} para ${petName} (${ownerName}) está pendiente. Fecha límite: ${dueDate.toLocaleDateString()}`;

      // Crear notificación para todos los administradores
      const admins = await User.find({ role: 'admin' });

      const notifications = admins.map(admin => ({
        title,
        message,
        type: 'medical_reminder',
        recipient: admin._id,
        priority,
        data: {
          petName,
          ownerName,
          productName,
          dueDate: dueDate.toISOString(),
          alertType: 'deworming',
        }
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        console.log(`Alerta de desparasitación creada para ${petName}`);
      }

      return notifications.length;
    } catch (error) {
      console.error('Error creando alerta de desparasitación:', error);
      throw error;
    }
  }

  /**
   * Crear alerta de seguimiento de tratamiento
   */
  static async createTreatmentFollowUp(treatmentData) {
    try {
      const {
        petName,
        ownerName,
        treatmentName,
        currentDose,
        totalDoses,
        nextDoseDate,
        priority = 'medium'
      } = treatmentData;

      const title = `Seguimiento de tratamiento: ${petName}`;
      const message = `Tratamiento ${treatmentName} para ${petName} (${ownerName}). Dosis ${currentDose}/${totalDoses}. Próxima dosis: ${nextDoseDate.toLocaleDateString()}`;

      // Crear notificación para todos los administradores
      const admins = await User.find({ role: 'admin' });

      const notifications = admins.map(admin => ({
        title,
        message,
        type: 'medical_reminder',
        recipient: admin._id,
        priority,
        data: {
          petName,
          ownerName,
          treatmentName,
          currentDose,
          totalDoses,
          nextDoseDate: nextDoseDate.toISOString(),
          alertType: 'treatment_followup',
        }
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        console.log(`Alerta de seguimiento de tratamiento creada para ${petName}`);
      }

      return notifications.length;
    } catch (error) {
      console.error('Error creando alerta de seguimiento de tratamiento:', error);
      throw error;
    }
  }

  /**
   * Crear alerta de cumpleaños de mascota
   */
  static async createPetBirthdayAlert(petData) {
    try {
      const {
        petName,
        ownerName,
        birthday,
        age,
        priority = 'low'
      } = petData;

      const title = `¡Cumpleaños de ${petName}!`;
      const message = `${petName} (${ownerName}) cumple ${age} años el ${birthday.toLocaleDateString()}`;

      // Crear notificación para todos los administradores
      const admins = await User.find({ role: 'admin' });

      const notifications = admins.map(admin => ({
        title,
        message,
        type: 'custom',
        recipient: admin._id,
        priority,
        data: {
          petName,
          ownerName,
          birthday: birthday.toISOString(),
          age,
          alertType: 'pet_birthday',
        }
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        console.log(`Alerta de cumpleaños creada para ${petName}`);
      }

      return notifications.length;
    } catch (error) {
      console.error('Error creando alerta de cumpleaños:', error);
      throw error;
    }
  }

  /**
   * Crear alerta de producto próximo a vencer (si aplica fechas de caducidad)
   */
  static async createExpiringProductAlert(productData) {
    try {
      const {
        productName,
        productType,
        expiryDate,
        daysUntilExpiry,
        priority = 'high'
      } = productData;

      const title = `Producto próximo a vencer: ${productName}`;
      const message = `El producto ${productName} (${productType}) vencerá en ${daysUntilExpiry} días (${expiryDate.toLocaleDateString()})`;

      // Crear notificación para todos los administradores
      const admins = await User.find({ role: 'admin' });

      const notifications = admins.map(admin => ({
        title,
        message,
        type: 'system_alert',
        recipient: admin._id,
        priority,
        data: {
          productName,
          productType,
          expiryDate: expiryDate.toISOString(),
          daysUntilExpiry,
          alertType: 'expiring_product',
        }
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        console.log(`Alerta de producto próximo a vencer creada para ${productName}`);
      }

      return notifications.length;
    } catch (error) {
      console.error('Error creando alerta de producto próximo a vencer:', error);
      throw error;
    }
  }

  /**
   * Crear alerta de mantenimiento del sistema
   */
  static async createSystemMaintenanceAlert(maintenanceData) {
    try {
      const {
        title,
        message,
        scheduledDate,
        estimatedDuration,
        priority = 'medium'
      } = maintenanceData;

      // Crear notificación para todos los administradores
      const admins = await User.find({ role: 'admin' });

      const notifications = admins.map(admin => ({
        title: title || 'Mantenimiento del sistema programado',
        message: message || `Mantenimiento programado para ${scheduledDate.toLocaleDateString()}`,
        type: 'system_alert',
        recipient: admin._id,
        priority,
        data: {
          scheduledDate: scheduledDate.toISOString(),
          estimatedDuration,
          alertType: 'system_maintenance',
        }
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        console.log('Alerta de mantenimiento del sistema creada');
      }

      return notifications.length;
    } catch (error) {
      console.error('Error creando alerta de mantenimiento:', error);
      throw error;
    }
  }

  /**
   * Crear alerta personalizada para un usuario específico
   */
  static async createCustomUserAlert(userId, alertData) {
    try {
      const {
        title,
        message,
        type = 'custom',
        priority = 'medium'
      } = alertData;

      const notification = new Notification({
        title,
        message,
        type,
        recipient: userId,
        priority,
        data: {
          ...alertData.data,
          alertType: 'custom_user',
        }
      });

      await notification.save();
      console.log(`Alerta personalizada creada para usuario ${userId}`);

      return notification;
    } catch (error) {
      console.error('Error creando alerta personalizada:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas específicas del negocio
   */
  static async getBusinessNotificationStats() {
    try {
      const stats = await Notification.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            unreadCount: {
              $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
            },
            avgPriority: { $avg: { $cond: [
              { $eq: ['$priority', 'low'] }, 1,
              { $eq: ['$priority', 'medium'] }, 2,
              { $eq: ['$priority', 'high'] }, 3,
              { $eq: ['$priority', 'urgent'] }, 4,
              2
            ]}}
          }
        },
        {
          $project: {
            type: '$_id',
            count: 1,
            unreadCount: 1,
            avgPriority: { $round: ['$avgPriority', 1] }
          }
        },
        { $sort: { count: -1 } }
      ]);

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas de negocio:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;