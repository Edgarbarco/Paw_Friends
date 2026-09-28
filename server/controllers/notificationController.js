const Notification = require('../models/notificationModel');
const User = require('../models/UserModel');

// Obtener todas las notificaciones de un usuario
exports.getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead, type } = req.query;
    const userId = req.user.id;

    // Construir filtros
    const filter = { recipient: userId };
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (type) filter.type = type;

    const notifications = await Notification.find(filter)
      .populate('relatedProduct', 'name type')
      .populate('relatedHistory', 'petName ownerName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(filter);

    res.status(200).json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener las notificaciones',
      error: error.message
    });
  }
};

// Obtener una notificación específica
exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('relatedProduct', 'name type quantity')
      .populate('relatedHistory', 'petName ownerName medication weight');

    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    // Verificar que el usuario solo pueda ver sus propias notificaciones
    if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para ver esta notificación' });
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener la notificación',
      error: error.message
    });
  }
};

// Marcar notificación como leída
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    // Verificar permisos
    if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para modificar esta notificación' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      message: 'Notificación marcada como leída',
      notification
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al marcar la notificación como leída',
      error: error.message
    });
  }
};

// Marcar todas las notificaciones como leídas
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      message: 'Todas las notificaciones han sido marcadas como leídas'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al marcar todas las notificaciones como leídas',
      error: error.message
    });
  }
};

// Crear nueva notificación (principalmente para uso interno del sistema)
exports.createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error al crear notificación:', error);
    throw error;
  }
};

// Crear notificación personalizada (para administradores)
exports.createCustomNotification = async (req, res) => {
  try {
    const { title, message, type, recipient, priority, expiresAt } = req.body;

    const notification = new Notification({
      title,
      message,
      type: type || 'custom',
      recipient,
      priority: priority || 'medium',
      expiresAt,
    });

    await notification.save();

    res.status(201).json({
      message: 'Notificación creada exitosamente',
      notification
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear la notificación',
      error: error.message
    });
  }
};

// Eliminar notificación
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    // Verificar permisos
    if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para eliminar esta notificación' });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Notificación eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar la notificación',
      error: error.message
    });
  }
};

// Obtener estadísticas de notificaciones (para dashboard)
exports.getNotificationStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const matchFilter = isAdmin ? {} : { recipient: userId };

    const stats = await Notification.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          },
          byType: {
            $push: '$type'
          },
          byPriority: {
            $push: '$priority'
          }
        }
      }
    ]);

    const typeStats = await Notification.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const priorityStats = await Notification.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      total: stats[0]?.total || 0,
      unread: stats[0]?.unread || 0,
      byType: typeStats,
      byPriority: priorityStats,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener estadísticas de notificaciones',
      error: error.message
    });
  }
};

// Obtener notificaciones no leídas (para badge/contador)
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener conteo de notificaciones no leídas',
      error: error.message
    });
  }
};