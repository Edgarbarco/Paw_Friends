const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authmiddleware'); 

// Rutas protegidas
router.get('/', protect, authorize('admin'), userController.getUsers); //Solo admin
router.get('/me', protect, userController.getMe); //Usuario autenticado
router.get('/me/notifications/preferences', protect, userController.getNotificationPreferences); //Usuario autenticado
router.get('/:id', protect, authorize('admin'), userController.getUserById); //Solo admin
router.post('/', protect, authorize('admin'), userController.createUser); //Solo admin
router.put('/:id', protect, authorize('admin'), userController.updateUser); //Solo admin
router.patch('/:id/estado', protect, authorize('admin'), userController.updateEstadoUsuario); //Solo admin
router.put('/me/notifications/preferences', protect, userController.updateNotificationPreferences); //Usuario autenticado
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);//Solo admin

module.exports = router;
