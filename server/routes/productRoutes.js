const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authmiddleware');
const { generateProductNotifications, checkLowStock } = require('../middlewares/notificationMiddleware');

router.get('/', productController.getProducts); // Publico
router.get('/:id', productController.getProductById); // Publico
router.post('/', generateProductNotifications, checkLowStock, productController.createProduct); // Temporalmente público para testing
router.put('/:id', protect, authorize('admin'), generateProductNotifications, checkLowStock, productController.updateProduct);// Solo admin
router.delete('/:id', protect, authorize('admin'), generateProductNotifications, productController.deleteProduct);

module.exports = router;