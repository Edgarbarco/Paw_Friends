const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, authorize } = require('../middlewares/authmiddleware');

// Server-Sent Events endpoint para notificaciones en tiempo real
router.get('/events', async (req, res) => {
  // Autenticación por token en query param
  const jwt = require('jsonwebtoken');
  const User = require('../models/UserModel');
  const token = req.query.token;
  if (!token) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'No autorizado, token requerido' }));
    return;
  }
  let user;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[SSE] Token decodificado:', decoded);
    user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.error('[SSE] Usuario no encontrado para ID:', decoded.id);
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Usuario no encontrado' }));
      return;
    }
    req.user = user;
  } catch (error) {
    console.error('[SSE] Error al validar token:', error);
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Token inválido o expirado', error: error.message }));
    return;
  }

  // Configurar headers para SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  // Enviar un mensaje inicial
  res.write('data: {"type": "connection", "message": "Conectado al servidor de notificaciones"}\n\n');

  // Registrar la conexión SSE
  const { registerSSEConnection } = require('../middlewares/notificationMiddleware');
  registerSSEConnection(res);

  // Mantener la conexión viva con un ping cada 25 segundos
  const pingInterval = setInterval(() => {
    res.write('data: {"type": "ping"}\n\n');
  }, 25000);

  res.on('close', () => {
    clearInterval(pingInterval);
  });

  console.log('Nueva conexión SSE establecida para usuario:', user.email);
});

// Todas las rutas requieren autenticación
router.use(protect);

// Rutas para usuarios autenticados
router.get('/', notificationController.getUserNotifications);
router.get('/stats', notificationController.getNotificationStats);
router.get('/unread-count', notificationController.getUnreadCount);
router.get('/:id', notificationController.getNotificationById);
router.put('/:id/read', notificationController.markAsRead);
router.put('/mark-all-read', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

// Rutas solo para administradores
router.post('/custom', authorize('admin'), notificationController.createCustomNotification);

module.exports = router;