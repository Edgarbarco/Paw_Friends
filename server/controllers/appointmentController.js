const Appointment = require('../models/appointmentModel');
const Pet = require('../models/petModel');
const User = require('../models/UserModel');
const { notifyAdmins } = require('../middlewares/notificationMiddleware');

// Obtener todas las citas con filtros avanzados
exports.getAllAppointments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      veterinarian,
      startDate,
      endDate,
      petName,
      clientEmail,
      sortBy = 'appointmentDate',
      sortOrder = 'asc'
    } = req.query;

    // Construir filtros
    const filter = {};
    if (status) filter.status = status;
    if (veterinarian) filter.veterinarian = veterinarian;
    if (petName) filter.petName = { $regex: petName, $options: 'i' };
    if (clientEmail) filter.clientEmail = { $regex: clientEmail, $options: 'i' };

    // Filtro de fechas
    if (startDate || endDate) {
      filter.appointmentDate = {};
      if (startDate) filter.appointmentDate.$gte = new Date(startDate);
      if (endDate) filter.appointmentDate.$lte = new Date(endDate);
    }

    // Construir ordenamiento
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const appointments = await Appointment.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name email');

    const total = await Appointment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error obteniendo citas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las citas',
      error: error.message,
    });
  }
};

// Obtener citas del día
exports.getTodayAppointments = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ appointmentDate: 1 });

    res.status(200).json({
      success: true,
      data: appointments,
      count: appointments.length,
    });
  } catch (error) {
    console.error('Error obteniendo citas del día:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas del día',
      error: error.message,
    });
  }
};

// Obtener citas próximas (próximos 7 días)
exports.getUpcomingAppointments = async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: today,
        $lte: nextWeek,
      },
      status: { $in: ['scheduled', 'confirmed'] },
    }).sort({ appointmentDate: 1 });

    res.status(200).json({
      success: true,
      data: appointments,
      count: appointments.length,
    });
  } catch (error) {
    console.error('Error obteniendo citas próximas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas próximas',
      error: error.message,
    });
  }
};

// Crear nueva cita
exports.createAppointment = async (req, res) => {
  try {
    const appointmentData = {
      ...req.body,
      clientEmail: req.body.clientEmail,
      clientPhone: req.body.clientPhone,
      createdBy: req.user.id,
    };

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    // Crear notificación automática
    await notifyAdmins(
      `Nueva cita programada: ${appointment.petName}`,
      `Se ha programado una nueva cita para ${appointment.petName} (${appointment.clientName}) el ${appointment.appointmentDate.toLocaleDateString()}`,
      'appointment_reminder',
      'medium'
    );

    res.status(201).json({
      success: true,
      message: 'Cita creada exitosamente',
      data: appointment,
    });
  } catch (error) {
    console.error('Error creando cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la cita',
      error: error.message,
    });
  }
};

// Obtener cita por ID
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Error obteniendo cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la cita',
      error: error.message,
    });
  }
};

// Actualizar cita
exports.updateAppointment = async (req, res) => {
  try {
    const prevAppointment = await Appointment.findById(req.params.id);
    const updateData = {
      ...req.body,
      clientEmail: req.body.clientEmail,
      clientPhone: req.body.clientPhone,
      updatedBy: req.user.id,
    };
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada',
      });
    }

    // Si el estado 'completed' cambió a true, enviar correo automático
    if (!prevAppointment.completed && appointment.completed) {
      const emailService = require('../services/emailService');
      await emailService.sendNotificationEmail(
        appointment.clientEmail,
        {
          title: 'Cita completada',
          message: `Hola ${appointment.clientName},<br><br>Tu cita para ${appointment.petName} ha sido marcada como completada.<br>Si tienes dudas o necesitas seguimiento, contáctanos.<br><br>¡Gracias por confiar en PawFriends!`,
          priority: 'low',
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Cita actualizada exitosamente',
      data: appointment,
    });
  } catch (error) {
    console.error('Error actualizando cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la cita',
      error: error.message,
    });
  }
};

// Eliminar cita
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cita eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la cita',
      error: error.message,
    });
  }
};

// Cambiar estado de la cita
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'El estado es requerido',
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, updatedBy: req.user.id },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada',
      });
    }

    // Crear notificación según el nuevo estado
    let notificationMessage = '';
    switch (status) {
      case 'confirmed':
        notificationMessage = `Cita confirmada: ${appointment.petName} - ${appointment.appointmentDate.toLocaleDateString()}`;
        break;
      case 'cancelled':
        notificationMessage = `Cita cancelada: ${appointment.petName} - ${appointment.appointmentDate.toLocaleDateString()}`;
        break;
      case 'completed':
        notificationMessage = `Cita completada: ${appointment.petName} - ${appointment.appointmentDate.toLocaleDateString()}`;
        break;
    }

    if (notificationMessage) {
      await notifyAdmins(
        `Cita ${status}: ${appointment.petName}`,
        notificationMessage,
        'appointment_reminder',
        status === 'cancelled' ? 'medium' : 'low'
      );
    }

    res.status(200).json({
      success: true,
      message: `Cita marcada como ${status}`,
      data: appointment,
    });
  } catch (error) {
    console.error('Error actualizando estado de cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el estado de la cita',
      error: error.message,
    });
  }
};

// Obtener citas por veterinario
exports.getAppointmentsByVeterinarian = async (req, res) => {
  try {
    const { veterinarian } = req.params;
    const { startDate, endDate } = req.query;

    const filter = { veterinarian };
    if (startDate || endDate) {
      filter.appointmentDate = {};
      if (startDate) filter.appointmentDate.$gte = new Date(startDate);
      if (endDate) filter.appointmentDate.$lte = new Date(endDate);
    }

    const appointments = await Appointment.find(filter)
      .sort({ appointmentDate: 1 });

    res.status(200).json({
      success: true,
      data: appointments,
      count: appointments.length,
    });
  } catch (error) {
    console.error('Error obteniendo citas por veterinario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas del veterinario',
      error: error.message,
    });
  }
};

// Obtener estadísticas de citas
exports.getAppointmentStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Estadísticas básicas
    const totalAppointments = await Appointment.countDocuments();
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lte: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    const thisMonthAppointments = await Appointment.countDocuments({
      appointmentDate: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    // Estadísticas por estado
    const statusStats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Próximas citas (hoy y mañana)
    const upcomingAppointments = await Appointment.find({
      appointmentDate: {
        $gte: new Date(),
        $lte: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
      },
      status: { $in: ['scheduled', 'confirmed'] },
    }).sort({ appointmentDate: 1 });

    res.status(200).json({
      success: true,
      data: {
        total: totalAppointments,
        today: todayAppointments,
        thisMonth: thisMonthAppointments,
        statusBreakdown: statusStats,
        upcoming: upcomingAppointments,
      },
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de citas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de citas',
      error: error.message,
    });
  }
};