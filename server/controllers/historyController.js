const History = require('../models/historyModel');

// Obtener todas las citas
exports.getAllHistories = async (req, res) => {
  try {
    const histories = await History.find();
    res.status(200).json(histories);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener historial', error });
  }
};

// Crear nueva cita
exports.createHistory = async (req, res) => {
  try {
    const historyData = {
      ...req.body,
      completed: false // Por defecto false al crear
    };
    const nueva = new History(historyData);
    await nueva.save();
    res.status(201).json({
      message: 'Cita creada exitosamente',
      data: nueva,
      success: true
    });
  } catch (error) {
    console.error('Error creando cita:', error);
    res.status(500).json({
      message: 'Error al crear cita',
      error: error.message,
      success: false
    });
  }
};

// Actualizar cita
exports.updateHistory = async (req, res) => {
  try {
    const prevHistory = await History.findById(req.params.id);
    const actualizada = await History.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Si el estado 'completed' cambió a true, enviar correo automático
    if (!prevHistory.completed && actualizada.completed) {
      const emailService = require('../services/emailService');
      await emailService.sendNotificationEmail(
        actualizada.ownerEmail,
        {
          title: 'Cita completada',
          message: `Hola ${actualizada.ownerName},<br><br>Tu cita para ${actualizada.petName} ha sido marcada como completada.<br>Si tienes dudas o necesitas seguimiento, contáctanos.<br><br>¡Gracias por confiar en PawFriends!`,
          priority: 'low',
        }
      );
    }
    
    res.status(200).json({ message: 'Cita actualizada', data: actualizada });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar cita', error });
  }
};

// Eliminar cita
exports.deleteHistory = async (req, res) => {
  try {
    await History.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Cita eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar cita', error });
  }
};
