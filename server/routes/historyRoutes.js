const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { protect, authorize } = require('../middlewares/authmiddleware');

router.get('/', historyController.getAllHistories); // Temporalmente público para testing
router.post('/', historyController.createHistory); // Temporalmente público para testing
router.put('/:id', protect, authorize('admin'), historyController.updateHistory);
router.delete('/:id', protect, authorize('admin'), historyController.deleteHistory);

module.exports = router;
