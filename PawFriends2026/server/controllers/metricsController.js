const Appointment = require('../models/appointmentModel');
const Pet = require('../models/petModel');
const Product = require('../models/productModel.js');
const User = require('../models/UserModel');
const Notification = require('../models/notificationModel');
const Metric = require('../models/metricsModel');

// Obtener métricas generales del dashboard
exports.getDashboardMetrics = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Métricas básicas
    const totalAppointments = await Appointment.countDocuments();
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lte: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    const totalPets = await Pet.countDocuments({ isActive: true });
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();

    // Citas del mes actual
    const monthlyAppointments = await Appointment.countDocuments({
      appointmentDate: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    // Productos con stock bajo
    const lowStockProducts = await Product.countDocuments({
      quantity: { $lte: 5, $gt: 0 },
    });

    // Notificaciones no leídas
    const unreadNotifications = await Notification.countDocuments({
      isRead: false,
    });

    // Próximas citas (hoy y mañana)
    const upcomingAppointments = await Appointment.find({
      appointmentDate: {
        $gte: new Date(),
        $lte: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
      },
      status: { $in: ['scheduled', 'confirmed'] },
    }).sort({ appointmentDate: 1 });

    // Mascotas con vacunas próximas
    const petsWithUpcomingVaccinations = await Pet.countDocuments({
      isActive: true,
      'vaccinations.nextDueDate': {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Ingresos del mes (calculado de citas completadas)
    const completedAppointments = await Appointment.find({
      status: 'completed',
      appointmentDate: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    const monthlyRevenue = completedAppointments.reduce((total, appointment) => {
      return total + appointment.getTotalCost();
    }, 0);

    // Estadísticas por estado de citas
    const appointmentStatusStats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Estadísticas por tipo de mascota
    const petTypeStats = await Pet.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalAppointments,
          todayAppointments,
          totalPets,
          totalProducts,
          totalUsers,
          monthlyAppointments,
          monthlyRevenue,
          lowStockProducts,
          unreadNotifications,
        },
        upcoming: {
          appointments: upcomingAppointments,
          vaccinations: petsWithUpcomingVaccinations,
        },
        breakdowns: {
          appointmentsByStatus: appointmentStatusStats,
          petsByType: petTypeStats,
        },
      },
    });
  } catch (error) {
    console.error('Error obteniendo métricas del dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener métricas del dashboard',
      error: error.message,
    });
  }
};

// Obtener métricas de citas
exports.getAppointmentMetrics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    // Calcular fechas según el período
    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Métricas de citas
    const totalAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: startDate },
    });

    const completedAppointments = await Appointment.countDocuments({
      status: 'completed',
      appointmentDate: { $gte: startDate },
    });

    const cancelledAppointments = await Appointment.countDocuments({
      status: 'cancelled',
      appointmentDate: { $gte: startDate },
    });

    // Ingresos por citas completadas
    const revenueAppointments = await Appointment.find({
      status: 'completed',
      appointmentDate: { $gte: startDate },
    });

    const totalRevenue = revenueAppointments.reduce((total, appointment) => {
      return total + appointment.getTotalCost();
    }, 0);

    // Promedio de citas por día
    const daysDiff = Math.ceil((now - startDate) / (24 * 60 * 60 * 1000));
    const avgAppointmentsPerDay = daysDiff > 0 ? (totalAppointments / daysDiff).toFixed(1) : 0;

    // Citas por veterinario
    const appointmentsByVeterinarian = await Appointment.aggregate([
      { $match: { appointmentDate: { $gte: startDate } } },
      {
        $group: {
          _id: '$veterinarian',
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $sum: {
                $map: {
                  input: '$services',
                  as: 'service',
                  in: '$$service.price',
                },
              },
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        summary: {
          total: totalAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
          completionRate: totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(1) : 0,
          totalRevenue,
          avgPerDay: avgAppointmentsPerDay,
        },
        byVeterinarian: appointmentsByVeterinarian,
      },
    });
  } catch (error) {
    console.error('Error obteniendo métricas de citas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener métricas de citas',
      error: error.message,
    });
  }
};

// Obtener métricas de productos
exports.getProductMetrics = async (req, res) => {
  try {
    // Productos totales
    const totalProducts = await Product.countDocuments();

    // Productos por tipo
    const productsByType = await Product.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          avgQuantity: { $avg: '$quantity' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Productos con stock bajo
    const lowStockProducts = await Product.find({
      quantity: { $lte: 5, $gt: 0 },
    }).sort({ quantity: 1 });

    // Productos sin stock
    const outOfStockProducts = await Product.countDocuments({
      quantity: 0,
    });

    // Productos agregados recientemente (últimos 30 días)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentProducts = await Product.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalProducts,
        byType: productsByType,
        inventory: {
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts,
          recent: recentProducts,
        },
      },
    });
  } catch (error) {
    console.error('Error obteniendo métricas de productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener métricas de productos',
      error: error.message,
    });
  }
};

// Obtener métricas de mascotas
exports.getPetMetrics = async (req, res) => {
  try {
    // Estadísticas básicas
    const totalPets = await Pet.countDocuments({ isActive: true });

    // Mascotas por tipo
    const petsByType = await Pet.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    // Mascotas con vacunas próximas (30 días)
    const petsWithUpcomingVaccinations = await Pet.countDocuments({
      isActive: true,
      'vaccinations.nextDueDate': {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Mascotas que requieren seguimiento médico
    const petsNeedingFollowUp = await Pet.countDocuments({
      isActive: true,
      'medicalHistory.followUpRequired': true,
      'medicalHistory.followUpDate': {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Costo promedio de atención médica
    const petsWithMedicalCost = await Pet.aggregate([
      {
        $project: {
          name: 1,
          totalCost: { $sum: '$medicalHistory.cost' },
        },
      },
      {
        $group: {
          _id: null,
          avgCost: { $avg: '$totalCost' },
          totalCost: { $sum: '$totalCost' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalPets,
        byType: petsByType,
        health: {
          upcomingVaccinations: petsWithUpcomingVaccinations,
          needingFollowUp: petsNeedingFollowUp,
        },
        financial: {
          avgMedicalCost: petsWithMedicalCost[0]?.avgCost || 0,
          totalMedicalCost: petsWithMedicalCost[0]?.totalCost || 0,
        },
      },
    });
  } catch (error) {
    console.error('Error obteniendo métricas de mascotas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener métricas de mascotas',
      error: error.message,
    });
  }
};

// Obtener métricas financieras
exports.getFinancialMetrics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    // Calcular fechas según el período
    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Ingresos por citas completadas
    const completedAppointments = await Appointment.find({
      status: 'completed',
      appointmentDate: { $gte: startDate },
    });

    const totalRevenue = completedAppointments.reduce((total, appointment) => {
      return total + appointment.getTotalCost();
    }, 0);

    // Número de citas completadas
    const completedCount = completedAppointments.length;

    // Promedio por cita
    const avgRevenuePerAppointment = completedCount > 0 ? (totalRevenue / completedCount).toFixed(2) : 0;

    // Ingresos por veterinario
    const revenueByVeterinarian = await Appointment.aggregate([
      {
        $match: {
          status: 'completed',
          appointmentDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$veterinarian',
          totalRevenue: {
            $sum: {
              $sum: {
                $map: {
                  input: '$services',
                  as: 'service',
                  in: '$$service.price',
                },
              },
            },
          },
          appointmentCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        summary: {
          totalRevenue,
          completedAppointments: completedCount,
          avgPerAppointment: avgRevenuePerAppointment,
        },
        byVeterinarian: revenueByVeterinarian,
      },
    });
  } catch (error) {
    console.error('Error obteniendo métricas financieras:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener métricas financieras',
      error: error.message,
    });
  }
};