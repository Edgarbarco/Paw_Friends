const Notification = require('../models/notificationModel');
const Product = require('../models/productModel.js');
const User = require('../models/UserModel');
const emailService = require('../services/emailService');

// Almacenar conexiones SSE activas
const sseConnections = new Set();

// Middleware para generar notificaciones automáticas en operaciones de productos
exports.generateProductNotifications = async (req, res, next) => {
  try {
    const originalSend = res.json;
    const operation = getOperationType(req);

    // Interceptar la respuesta para generar notificaciones después de operaciones exitosas
    res.json = function(data) {
      // Solo generar notificaciones si la operación fue exitosa
      if (res.statusCode >= 200 && res.statusCode < 300) {
        generateNotificationsForProduct(req, operation, data);
      }

      // Llamar al método original
      originalSend.call(this, data);
    };

    next();
  } catch (error) {
    console.error('Error en middleware de notificaciones:', error);
    next();
  }
};

// Función para determinar el tipo de operación
function getOperationType(req) {
  if (req.method === 'POST') return 'create';
  if (req.method === 'PUT') return 'update';
  if (req.method === 'DELETE') return 'delete';
  return 'unknown';
}

// Función para generar notificaciones según la operación
async function generateNotificationsForProduct(req, operation, responseData) {
  try {
    // Obtener todos los administradores con sus preferencias
    const admins = await User.find({ role: 'admin' });

    if (admins.length === 0) return;

    const notifications = [];

    switch (operation) {
      case 'create':
        // Notificar creación de nuevo producto
        for (const admin of admins) {
          // Verificar si el usuario tiene habilitado este tipo de notificación
          if (admin.notificationPreferences?.types?.new_product !== false) {
            notifications.push({
              title: 'Nuevo producto agregado',
              message: `Se ha agregado un nuevo producto: ${req.body.name}`,
              type: 'new_product',
              recipient: admin._id,
              relatedProduct: responseData.product?._id || responseData.product?.id,
              priority: 'medium',
              data: {
                productName: req.body.name,
                productType: req.body.type,
                quantity: req.body.quantity,
              }
            });
          }
        }
        break;

      case 'update':
        // Notificar actualización de producto
        for (const admin of admins) {
          // Verificar si el usuario tiene habilitado este tipo de notificación
          if (admin.notificationPreferences?.types?.product_updated !== false) {
            notifications.push({
              title: 'Producto actualizado',
              message: `El producto "${req.body.name || 'desconocido'}" ha sido actualizado`,
              type: 'product_updated',
              recipient: admin._id,
              relatedProduct: req.params.id,
              priority: 'low',
              data: {
                productName: req.body.name,
                changes: req.body,
              }
            });
          }
        }
        break;

      case 'delete':
        // Notificar eliminación de producto
        for (const admin of admins) {
          // Verificar si el usuario tiene habilitado este tipo de notificación
          if (admin.notificationPreferences?.types?.product_deleted !== false) {
            notifications.push({
              title: 'Producto eliminado',
              message: `Un producto ha sido eliminado del inventario`,
              type: 'product_deleted',
              recipient: admin._id,
              priority: 'medium',
              data: {
                productId: req.params.id,
              }
            });
          }
        }
        break;
    }

    // Crear todas las notificaciones
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);

      // Enviar emails si el servicio está disponible
      if (emailService.isEmailAvailable()) {
        try {
          // Obtener información completa de usuarios para enviar emails
          const notificationsWithUsers = await Promise.all(
            notifications.map(async (notification) => {
              const user = await User.findById(notification.recipient);
              return {
                ...notification,
                recipientEmail: user?.email,
              };
            })
          );

          // Enviar emails en segundo plano
          emailService.sendBulkNotificationEmails(notificationsWithUsers)
            .catch(error => console.error('Error enviando emails:', error));
        } catch (error) {
          console.error('Error preparando emails:', error);
        }
      }

      console.log(`Se generaron ${notifications.length} notificaciones automáticas`);
    }

  } catch (error) {
    console.error('Error generando notificaciones automáticas:', error);
  }
}

// Middleware para verificar stock bajo después de operaciones de productos
exports.checkLowStock = async (req, res, next) => {
  try {
    const originalSend = res.json;

    res.json = function(data) {
      // Verificar stock bajo después de operaciones exitosas
      if (res.statusCode >= 200 && res.statusCode < 300) {
        checkAndNotifyLowStock();
      }

      originalSend.call(this, data);
    };

    next();
  } catch (error) {
    console.error('Error en middleware de stock bajo:', error);
    next();
  }
};

// Función para verificar y notificar stock bajo
async function checkAndNotifyLowStock() {
  try {
    // Definir umbral de stock bajo (puedes hacer esto configurable)
    const LOW_STOCK_THRESHOLD = 5;

    // Buscar productos con stock bajo
    const lowStockProducts = await Product.find({
      quantity: { $lte: LOW_STOCK_THRESHOLD, $gt: 0 }
    });

    if (lowStockProducts.length === 0) return;

    // Obtener administradores
    const admins = await User.find({ role: 'admin' });

    if (admins.length === 0) return;

    // Crear notificaciones para productos con stock bajo
    const notifications = [];

    for (const product of lowStockProducts) {
      // Verificar si ya existe una notificación reciente para este producto
      const existingNotification = await Notification.findOne({
        type: 'low_stock',
        relatedProduct: product._id,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Últimas 24 horas
      });

      if (!existingNotification) {
        for (const admin of admins) {
          // Verificar si el usuario tiene habilitado este tipo de notificación
          if (admin.notificationPreferences?.types?.low_stock !== false) {
            notifications.push({
              title: 'Stock bajo',
              message: `El producto "${product.name}" tiene stock bajo (${product.quantity} unidades restantes)`,
              type: 'low_stock',
              recipient: admin._id,
              relatedProduct: product._id,
              priority: product.quantity <= 2 ? 'urgent' : 'high',
              data: {
                productName: product.name,
                currentQuantity: product.quantity,
                threshold: LOW_STOCK_THRESHOLD,
              }
            });
          }
        }
      }
    }

    // Crear notificaciones si las hay
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`Se generaron ${notifications.length} notificaciones de stock bajo`);
    }

  } catch (error) {
    console.error('Error verificando stock bajo:', error);
  }
}

// Función para crear notificaciones personalizadas desde cualquier parte de la aplicación
exports.createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creando notificación personalizada:', error);
    throw error;
  }
};

// Función para notificar a todos los usuarios (broadcast)
exports.notifyAllUsers = async (title, message, type = 'system_alert', priority = 'medium') => {
  try {
    const users = await User.find({});
    const notifications = users.map(user => ({
      title,
      message,
      type,
      recipient: user._id,
      priority,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);

      // Enviar notificaciones en tiempo real a través de SSE
      await sendRealtimeNotifications(notifications);

      console.log(`Notificación broadcast enviada a ${users.length} usuarios`);
    }

    return notifications.length;
  } catch (error) {
    console.error('Error enviando notificación broadcast:', error);
    throw error;
  }
};

// Función para notificar solo a administradores
exports.notifyAdmins = async (title, message, type = 'system_alert', priority = 'medium') => {
  try {
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map(admin => ({
      title,
      message,
      type,
      recipient: admin._id,
      priority,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);

      // Enviar notificaciones en tiempo real a través de SSE
      await sendRealtimeNotifications(notifications);

      console.log(`Notificación enviada a ${admins.length} administradores`);
    }

    return notifications.length;
  } catch (error) {
    console.error('Error enviando notificación a administradores:', error);
    throw error;
  }
};

// Función para enviar notificaciones en tiempo real a través de SSE
async function sendRealtimeNotifications(notifications) {
  try {
    // Crear las notificaciones en la base de datos primero
    const createdNotifications = await Notification.insertMany(notifications);

    // Poblar información del usuario para enviar datos completos
    await Notification.populate(createdNotifications, [
      { path: 'recipient', select: 'name email' },
      { path: 'relatedProduct', select: 'name type' },
      { path: 'relatedHistory', select: 'petName ownerName' }
    ]);

    // Enviar a todas las conexiones SSE activas
    sseConnections.forEach(res => {
      try {
        createdNotifications.forEach(notification => {
          res.write(`data: ${JSON.stringify({
            type: 'new_notification',
            notification: notification
          })}\n\n`);
        });
      } catch (error) {
        console.error('Error enviando SSE:', error);
        sseConnections.delete(res);
      }
    });

    console.log(`Notificaciones en tiempo real enviadas a ${sseConnections.size} conexiones`);
  } catch (error) {
    console.error('Error enviando notificaciones en tiempo real:', error);
  }
}

// Función para registrar conexiones SSE
exports.registerSSEConnection = (res) => {
  sseConnections.add(res);

  // Remover conexión cuando se cierre
  res.on('close', () => {
    sseConnections.delete(res);
  });

  return sseConnections.size;
};

// Función para limpiar conexiones SSE cerradas
exports.cleanupSSEConnections = () => {
  sseConnections.forEach(res => {
    if (res.destroyed) {
      sseConnections.delete(res);
    }
  });
};

// Función para obtener estadísticas de conexiones SSE
exports.getSSEStats = () => {
  return {
    activeConnections: sseConnections.size,
    totalConnections: sseConnections.size,
  };
};