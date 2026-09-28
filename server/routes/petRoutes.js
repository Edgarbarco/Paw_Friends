const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const { protect, authorize } = require('../middlewares/authmiddleware');

// Todas las rutas requieren autenticación
router.use(protect);

// Rutas básicas de mascotas
router.get('/', petController.getAllPets);
router.post('/', authorize('admin'), petController.createPet);
router.get('/:id', petController.getPetById);
router.put('/:id', authorize('admin'), petController.updatePet);
router.delete('/:id', authorize('admin'), petController.deletePet);

// Rutas específicas
router.get('/owner/:ownerEmail', petController.getPetsByOwner);

// Funcionalidades médicas (solo administradores)
router.post('/:id/medical-record', authorize('admin'), petController.addMedicalRecord);
router.post('/:id/vaccination', authorize('admin'), petController.addVaccination);

// Estadísticas (solo administradores)
router.get('/admin/stats', authorize('admin'), petController.getPetStats);

module.exports = router;